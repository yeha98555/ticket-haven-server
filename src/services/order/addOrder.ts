import { RemainingSeatsInsufficientException } from '@/exceptions/RemainingSeatsInsufficient';
import { NotFoundException } from '@/exceptions/NotFoundException';
import ActivityModel from '@/models/activity';
import OrderModel from '@/models/order';
import SeatReservationModel, {
  SeatReservation,
} from '@/models/seatReservation';
import { Document, Types } from 'mongoose';
import { MongoServerError } from 'mongodb';
import createOrderNo from './createOrderNo';
import UserModel from '@/models/user';
import * as d from 'date-fns';
import { EventNotOnSaleException } from '@/exceptions/EventNotOnSale';

const addOrder = async (
  userId: string,
  data: {
    activityId: string;
    eventId: string;
    areaId: string;
    subAreaId: string;
    seatAmount: number;
  },
) => {
  const activity = await ActivityModel.findOne({
    _id: data.activityId,
    is_published: true,
  }).select('name location events areas');
  if (!activity) throw new NotFoundException('activity not found');

  const today = new Date();

  const event = activity.events.find((e) => e._id?.equals(data.eventId));
  const isOnSell =
    event &&
    d.isWithinInterval(today, {
      start: event.sell_at,
      end: event.sellend_at,
    });
  if (!event) throw new NotFoundException('event not found');
  if (!isOnSell) throw new EventNotOnSaleException();

  const area = activity.areas.find((a) => a._id?.equals(data.areaId));
  const subarea = area?.subareas.find((a) => a._id?.equals(data.subAreaId));
  if (!area || !subarea) throw new NotFoundException('area not found');

  const areaSeatTotal = subarea.rows.reduce((total, num) => total + num, 0);

  let orderSeats: { row: number; seat: number }[] = [];
  let reservationResult: Document<any, any, SeatReservation>;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const seatReservations = await SeatReservationModel.find({
      event_id: data.eventId,
    }).select('seats');

    const reservedSeats = seatReservations
      .flatMap((a) => a.seats)
      .filter((s) => s.subarea_id.equals(data.subAreaId));

    if (reservedSeats.length + data.seatAmount > areaSeatTotal)
      throw new RemainingSeatsInsufficientException();

    const availableSeats: { row: number; seat: number }[] = findAvailableSeats(
      { start: subarea.start_row, rows: subarea.rows },
      reservedSeats,
    );

    orderSeats = selectRandomSeats(data.seatAmount, availableSeats);

    try {
      reservationResult = new SeatReservationModel({
        activity_id: data.activityId,
        event_id: data.eventId,
        seats: orderSeats.map((s) => ({
          area_id: data.areaId,
          subarea_id: data.subAreaId,
          row: s.row,
          seat: s.seat,
        })),
      });
      await reservationResult.save();
      break;
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        continue;
      } else {
        throw error;
      }
    }
  }

  const orderId = new Types.ObjectId();
  const order = new OrderModel({
    _id: orderId,
    order_no: createOrderNo(orderId, today),
    user_id: userId,
    activity_id: data.activityId,
    event_id: data.eventId,
    seat_reservation_id: reservationResult._id,
    price: orderSeats.length * area.price,
  });

  try {
    await order.save();
  } catch (error) {
    Promise.all([reservationResult.deleteOne(), order.deleteOne()]);
    throw error;
  }

  const user = await UserModel.findById(userId);

  return {
    id: order._id,
    orderNo: order.order_no,
    status: order.status,
    createAt: order.create_at,
    price: order.price,
    user: {
      id: user!._id,
      name: user!.username,
      email: user!.email,
      cellphone: user!.phone,
    },
    activity: {
      id: activity._id,
      name: activity.name,
      location: activity.location,
      eventId: event?._id,
      eventStartTime: event?.start_at,
      eventEndTime: event?.end_at,
    },
    seats: orderSeats.map((s) => ({
      subAreaId: subarea._id,
      subAreaName: subarea.name,
      price: area.price,
      row: s.row,
      seat: s.seat,
    })),
  };
};

function findAvailableSeats(
  {
    start,
    rows,
  }: {
    start: number;
    rows: number[];
  },
  reservedSeats: { row: number; seat: number }[],
) {
  const availableSeats = [];

  for (let i = 0; i < rows.length; i++) {
    const row = start + i;
    const rowSeatAmount = rows[i];

    for (let seat = 1; seat <= rowSeatAmount; seat++) {
      if (!reservedSeats.find((rs) => rs.row === row && rs.seat === seat))
        availableSeats.push({ row, seat });
    }
  }

  return availableSeats;
}

function selectRandomSeats(
  selectNum: number,
  seats: { row: number; seat: number }[],
) {
  const startSeat = random(0, seats.length - selectNum);
  return seats.slice(startSeat, startSeat + selectNum);
}

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export default addOrder;

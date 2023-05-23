import { RemainingSeatsInsufficientException } from '@/exceptions/RemainingSeatsInsufficient';
import { NotFoundException } from '@/exceptions/NotFoundException';
import ActivityModel from '@/models/activity';
import OrderModel from '@/models/order';
import SeatReservationModel, {
  ISeatReservation,
} from '@/models/seatReservation';
import TicketModel from '@/models/ticket';
import { Document, Types } from 'mongoose';
import { MongoServerError } from 'mongodb';
import createOrderNo from './createOrderNo';
import ticketService from '../ticket';
import { SeatsAutoSelectionFailException } from '@/exceptions/SeatsAutoSelectFail';
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

  const seatReservations = await SeatReservationModel.find({
    event_id: data.eventId,
  }).select('seats');

  const reservedSeats = seatReservations
    .flatMap((a) => a.seats)
    .filter((s) => s.subarea_id.equals(data.subAreaId));

  if (reservedSeats.length + data.seatAmount > areaSeatTotal)
    throw new RemainingSeatsInsufficientException();

  const availableSeats: { row: number; seat: number }[] = [];

  for (let i = 0; i < subarea.rows.length; i++) {
    const row = subarea.start_row + i;
    const rowSeatAmount = subarea.rows[i];

    for (let seat = 1; seat <= rowSeatAmount; seat++) {
      if (!reservedSeats.find((rs) => rs.row === row && rs.seat === seat))
        availableSeats.push({ row, seat });
    }
  }

  const orderSeats = availableSeats.slice(0, data.seatAmount);

  let reservationResult: Document<any, any, ISeatReservation>;

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
  } catch (error) {
    if (error instanceof MongoServerError && error.code === '11000') {
      throw new SeatsAutoSelectionFailException();
    } else {
      throw error;
    }
  }

  const orderId = new Types.ObjectId();
  const order = new OrderModel({
    _id: orderId,
    order_no: createOrderNo(orderId, today),
    user_id: userId,
    activity_id: data.activityId,
    event_id: data.eventId,
    seat_reservation_id: reservationResult!._id,
    totalPrice: orderSeats.length * area.price,
  });

  const tickets = orderSeats.map((s) => {
    const _id = new Types.ObjectId();
    return {
      _id,
      ticket_no: ticketService.createTicketNo(_id, today, s.row, s.seat),
      order_id: orderId,
      original_order_id: orderId,
      activity_id: data.activityId,
      area_id: data.areaId,
      event_id: data.eventId,
      price: area.price,
      row: s.row,
      seat: s.seat,
      subarea_id: data.subAreaId,
    };
  });

  try {
    await order.save();
    await TicketModel.insertMany(tickets);
  } catch (error) {
    Promise.all([
      reservationResult.deleteOne(),
      order.deleteOne(),
      TicketModel.deleteMany()
        .where('_id')
        .in(tickets.map((t) => t._id)),
    ]);
    throw error;
  }

  const user = await UserModel.findById(userId);

  return {
    id: order._id,
    orderNo: order.order_no,
    status: order.status,
    createAt: order.create_at,
    price: order.totalPrice,
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
    tickets: tickets.map((t) => ({
      id: t._id,
      ticketNo: t.ticket_no,
      subAreaId: t.subarea_id,
      subAreaName: subarea.name,
      price: t.price,
      seat: t.seat,
    })),
  };
};

export default addOrder;

import { NoAvailableSeatsException } from '@/exceptions/NoAvailableSeats';
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

type AddOrder = (
  userId: string,
  data: {
    activityId: string;
    eventId: string;
    areaId: string;
    subAreaId: string;
    seatAmount: number;
  },
) => Promise<any>;

const addOrder: AddOrder = async (userId, data) => {
  const activity = await ActivityModel.findById(data.activityId).select(
    'events areas',
  );
  if (!activity) throw new NotFoundException('activity not found');

  const event = activity.events.find((e) => e._id?.equals(data.eventId));
  if (!event) throw new NotFoundException('event not found');

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
    throw new NoAvailableSeatsException();

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

  const today = new Date();

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
};

export default addOrder;

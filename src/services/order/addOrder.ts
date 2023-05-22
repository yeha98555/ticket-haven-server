import { NoAvailableSeatsException } from '@/exceptions/NoAvailableSeats';
import { NotFoundException } from '@/exceptions/NotFoundException';
import ActivityModel from '@/models/activity';
import OrderModel from '@/models/order';
import SeatReservationModel from '@/models/seatReservation';
import TicketModel from '@/models/ticket';
import { Types } from 'mongoose';
import createOrderNo from './createOrderNo';
import ticketService from '../ticket';

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

  try {
    const reservation = new SeatReservationModel({
      activity_id: data.activityId,
      event_id: data.eventId,
      seats: orderSeats.map((s) => ({
        area_id: data.areaId,
        subarea_id: data.subAreaId,
        row: s.row,
        seat: s.seat,
      })),
    });
    const result = await reservation.save();

    const orderId = new Types.ObjectId();
    const order = new OrderModel({
      _id: orderId,
      order_no: createOrderNo(orderId, today),
      user_id: userId,
      activity_id: data.activityId,
      event_id: data.eventId,
      seat_reservation_id: result._id,
    });

    const tickets = await TicketModel.insertMany(
      orderSeats.map((s) => {
        const _id = new Types.ObjectId();
        return {
          _id,
          ticket_no: ticketService.createTicketNo(_id, today, s.row, s.seat),
          order_id: order._id,
          activity_id: data.activityId,
          area_id: data.areaId,
          event_id: data.eventId,
          price: area.price,
          row: s.row,
          seat: s.seat,
          subarea_id: data.subAreaId,
        };
      }),
    );

    order.original_ticket_ids = tickets.map((t) => t._id);
    await order.save();

    return order;
  } catch (error) {
    console.error(error);
  }

  return undefined;
};

export default addOrder;

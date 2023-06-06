import { NotFoundException } from '@/exceptions/NotFoundException';
import { Activity } from '@/models/activity';
import OrderModel from '@/models/order';
import SeatReservationModel from '@/models/seatReservation';
import TicketModel from '@/models/ticket';
import { User } from '@/models/user';
import { Types } from 'mongoose';

const getOrderInfo = async (userId: string, orderNo: string) => {
  const order = await OrderModel.findOne({
    order_no: orderNo,
    user_id: userId,
  })
    .populate<{ user_id: User }>('user_id')
    .populate<{ activity_id: Activity }>('activity_id');

  if (!order) throw new NotFoundException();

  const event = order.activity_id.events.find((e) =>
    e._id?.equals(order.event_id),
  );

  let seats: {
    subAreaId: Types.ObjectId;
    subAreaName: string;
    price: number;
    row: number;
    seat: number;
  }[] = [];

  if (order.seat_reservation_id) {
    const reservation = await SeatReservationModel.findById(
      order.seat_reservation_id,
    );
    seats = reservation!.seats.map((s) => {
      const area = order.activity_id.areas.find((a) =>
        a._id?.equals(s.area_id),
      );
      const subArea = area!.subareas.find((a) => a._id?.equals(s.subarea_id));

      return {
        subAreaId: s.subarea_id,
        subAreaName: subArea!.name,
        price: area!.price,
        row: s.row,
        seat: s.seat,
      };
    });
  } else {
    const tickets = await TicketModel.find({ order_id: order._id });
    seats = tickets.map((t) => {
      const area = order.activity_id.areas.find((a) =>
        a._id?.equals(t.area_id),
      );
      const subArea = area!.subareas.find((a) => a._id?.equals(t.subarea_id));

      return {
        subAreaId: t.subarea_id,
        subAreaName: subArea!.name,
        price: t.price,
        row: t.row,
        seat: t.seat,
      };
    });
  }

  return {
    id: order._id,
    orderNo: order.order_no,
    createAt: order.create_at,
    status: order.status,
    price: order.price,
    user: {
      id: order.user_id._id,
      name: order.user_id.username,
      email: order.user_id.email,
      cellphone: order.user_id.phone,
    },
    activity: {
      id: order.activity_id._id,
      name: order.activity_id.name,
      location: order.activity_id.location,
      eventId: event?._id,
      eventStartTime: event?.start_at,
      eventEndTime: event?.end_at,
    },
    seats,
  };
};

export default getOrderInfo;

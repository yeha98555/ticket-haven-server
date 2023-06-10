import { Types } from 'mongoose';
import * as d from 'date-fns';

import { NotFoundException } from '@/exceptions/NotFoundException';
import ActivityModel from '@/models/activity';
import OrderModel from '@/models/order';
import UserModel from '@/models/user';
import { EventNotOnSaleException } from '@/exceptions/EventNotOnSale';
import { redis } from '@/connections/redis';
import reserveSeats from '../reserveSeats';
import createOrderNo from './createOrderNo';
import { key } from '../../orderExpireSubscriber';

const orderExpireTime = 1200; // seconds

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

  const { seats, reservation } = await reserveSeats({
    activity,
    ...data,
  });

  const orderId = new Types.ObjectId();
  const order = new OrderModel({
    _id: orderId,
    order_no: createOrderNo(orderId, today),
    user_id: userId,
    activity_id: data.activityId,
    event_id: data.eventId,
    seat_reservation_id: reservation._id,
    price: seats.length * area.price,
  });

  try {
    await order.save();
  } catch (error) {
    Promise.all([reservation.deleteOne(), order.deleteOne()]);
    throw error;
  }

  setOrderExpireEvent(order._id.toString(), orderExpireTime);

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
    seats: seats.map((s) => ({
      subAreaId: subarea._id,
      subAreaName: subarea.name,
      price: area.price,
      row: s.row,
      seat: s.seat,
    })),
  };
};

function setOrderExpireEvent(orderId: string, expire: number) {
  const k = key(orderId);
  redis.set(k, '');
  redis.expire(k, expire);
}

export default addOrder;

import { OrderStatus } from '@/enums/orderStatus';
import { NotFoundException } from '@/exceptions/NotFoundException';
import { OrderCannotModifyException } from '@/exceptions/OrderCannotModify';
import OrderModel from '@/models/order';
import ActivityModel from '@/models/activity';
import reserveSeats from '../reserveSeats';

const addSeats = async ({
  orderNo,
  userId,
  areaId,
  subAreaId,
  amount,
}: {
  orderNo: string;
  userId: string;
  areaId: string;
  subAreaId: string;
  amount: number;
}) => {
  const order = await OrderModel.findOne({ user_id: userId }).byNo(orderNo);
  if (!order) throw new NotFoundException();

  if (order.status !== OrderStatus.PENDING)
    throw new OrderCannotModifyException();

  const activity = await ActivityModel.findOne({
    _id: order.activity_id,
    is_published: true,
  }).select('areas');
  if (!activity) throw new NotFoundException('activity not found');

  const area = activity.areas.find((a) => a._id?.equals(areaId));
  const subarea = area?.subareas.find((a) => a._id?.equals(subAreaId));
  if (!area || !subarea) throw new NotFoundException('area not found');

  const { seats: newSeats } = await reserveSeats({
    reservationId: order.seat_reservation_id,
    activity,
    eventId: order.event_id,
    seatAmount: amount,
    areaId: areaId,
    subAreaId: subAreaId,
  });

  order.price = order.price + amount * area.price;

  await order.save();

  return newSeats.map((s) => ({
    subAreaId: subarea._id,
    subAreaName: subarea.name,
    price: area.price,
    row: s.row,
    seat: s.seat,
  }));
};

export default addSeats;

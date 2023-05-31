import { OrderStatus } from '@/enums/orderStatus';
import { NotFoundException } from '@/exceptions/NotFoundException';
import { OrderCannotModifyException } from '@/exceptions/OrderCannotModify';
import OrderModel from '@/models/order';
import SeatReservationModel from '@/models/seatReservation';

const cancelOrder = async (userId: string, orderNo: string) => {
  const order = await OrderModel.findOne({ user_id: userId }).byNo(orderNo);

  if (!order) throw new NotFoundException();
  if (order.status !== OrderStatus.UNPAID)
    throw new OrderCannotModifyException();

  await SeatReservationModel.findByIdAndDelete(order.seat_reservation_id);
  await order.deleteOne();

  return true;
};

export default cancelOrder;

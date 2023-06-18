import { redis, sub } from '@/connections/redis';
import OrderModel from '@/models/order';
import { OrderStatus } from '@/enums/orderStatus';
import SeatReservationModel from '@/models/seatReservation';

const redisDB = redis.options.db;

const channel = `__keyevent@${redisDB}__:expired`;
export const key = (orderId: string) => `order-expire-checking-${orderId}`;

const isOrderExpiredEvent = (key: string) =>
  key.startsWith('order-expire-checking-');
const getOrderId = (key: string) => key.replace('order-expire-checking-', '');

sub.subscribe(channel, (err) => {
  if (err) {
    throw err;
  }
});

sub.on('message', (channel, key) => {
  isOrderExpiredEvent(key) && onOrderExpire(getOrderId(key));
});

async function onOrderExpire(orderId: string) {
  const order = await OrderModel.findById(orderId);
  if (!order || order.status !== OrderStatus.PENDING) return;

  await SeatReservationModel.findByIdAndDelete(order.seat_reservation_id);
  await order.deleteOne();
}

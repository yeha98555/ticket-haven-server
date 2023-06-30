import { OrderStatus } from '@/enums/orderStatus';
import { NotFoundException } from '@/exceptions/NotFoundException';
import { OrderCannotModifyException } from '@/exceptions/OrderCannotModify';
import { OrderNoSeatsException } from '@/exceptions/SeatsCannotLessThanOne';
import ActivityModel from '@/models/activity';
import OrderModel from '@/models/order';
import SeatReservationModel from '@/models/seatReservation';

const deleteSeat = async ({
  orderNo,
  userId,
  subAreaId,
  row,
  seat,
}: {
  orderNo: string;
  userId: string;
  subAreaId: string;
  row: number;
  seat: number;
}) => {
  const order = await OrderModel.findOne({ user_id: userId }).byNo(orderNo);
  if (!order) throw new NotFoundException();

  if (order.status !== OrderStatus.PENDING)
    throw new OrderCannotModifyException();

  const reservation = await SeatReservationModel.findById(
    order.seat_reservation_id,
  );
  if (!reservation) return new Error('reservation not found');

  if (reservation.seats.length === 1) throw new OrderNoSeatsException();

  const activity = await ActivityModel.findOne({
    _id: reservation.activity_id,
    is_published: true,
  }).select('areas');
  if (!activity) throw new Error('activity not found');

  reservation.set(
    'seats',
    reservation.seats.filter(
      (s) =>
        !(s.subarea_id.equals(subAreaId) && s.row === row && s.seat === seat),
    ),
  );

  await reservation.save();

  const totalPrice = reservation.seats.reduce((p, s) => {
    const area = activity.areas.find((a) => a._id?.equals(s.area_id));
    if (!area) throw new Error('area not found');
    return p + area.price;
  }, 0);

  order.price = totalPrice;

  await order.save();

  return true;
};

export default deleteSeat;

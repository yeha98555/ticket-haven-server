import { OrderStatus } from '@/enums/orderStatus';
import { OrderCannotModifyException } from '@/exceptions/OrderCannotModify';
import { OrderNoSeatsException } from '@/exceptions/SeatsCannotLessThanOne';
import { Order } from '@/models/order';
import SeatReservationModel from '@/models/seatReservation';
import { HydratedDocument } from 'mongoose';

const deleteSeat = async ({
  order,
  areaId,
  subAreaId,
  row,
  seat,
}: {
  order: Pick<HydratedDocument<Order>, 'status' | 'seat_reservation_id'>;
  areaId: string;
  subAreaId: string;
  row: number;
  seat: number;
}) => {
  if (order.status !== OrderStatus.TEMP) throw new OrderCannotModifyException();

  const reservation = await SeatReservationModel.findById(
    order.seat_reservation_id,
  );
  if (!reservation) return true;

  if (reservation.seats.length === 1) throw new OrderNoSeatsException();

  reservation.set(
    'seats',
    reservation.seats.filter(
      (s) =>
        !(
          s.area_id.equals(areaId) &&
          s.subarea_id.equals(subAreaId) &&
          s.row === row &&
          s.seat === seat
        ),
    ),
  );

  await reservation.save();
  return true;
};

export default deleteSeat;

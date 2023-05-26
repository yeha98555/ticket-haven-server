import { NotFoundException } from '@/exceptions/NotFoundException';
import { RemainingSeatsInsufficientException } from '@/exceptions/RemainingSeatsInsufficient';
import SeatReservationModel, {
  SeatReservation,
} from '@/models/seatReservation';
import { HydratedDocument, Types } from 'mongoose';
import { MongoServerError } from 'mongodb';
import { Activity } from '@/models/activity';
import { OrderExceedSeatLimitException } from '@/exceptions/OrderExceedsSeatLimit';

const reserveSeats = async ({
  reservation,
  activity,
  eventId,
  areaId,
  subAreaId,
  seatAmount,
}: {
  reservation?: HydratedDocument<SeatReservation>;
  activity: Pick<HydratedDocument<Activity>, '_id' | 'areas'>;
  eventId: Types.ObjectId | string;
  areaId: Types.ObjectId | string;
  subAreaId: Types.ObjectId | string;
  seatAmount: number;
}) => {
  reservation ??= new SeatReservationModel({
    activity_id: activity._id,
    event_id: eventId,
    seats: [],
  });

  const area = activity.areas.find((a) => a._id?.equals(areaId));
  const subarea = area?.subareas.find((a) => a._id?.equals(subAreaId));
  if (!subarea) throw new NotFoundException('area not found');

  const areaSeatTotal = subarea.rows.reduce((total, num) => total + num, 0);

  let seats: {
    row: number;
    seat: number;
  }[] = [];

  if (reservation.seats.length + seatAmount > 4)
    throw new OrderExceedSeatLimitException();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const seatReservations = await SeatReservationModel.find({
      event_id: eventId,
    }).select('seats');

    const reservedSeats = seatReservations
      .flatMap((a) => a.seats)
      .filter((s) => s.subarea_id.equals(subAreaId));

    if (reservedSeats.length + seatAmount > areaSeatTotal)
      throw new RemainingSeatsInsufficientException();

    const availableSeats: { row: number; seat: number }[] = findAvailableSeats(
      { start: subarea.start_row, rows: subarea.rows },
      reservedSeats,
    );

    seats = selectRandomSeats(seatAmount, availableSeats);

    try {
      seats.forEach((s) => {
        reservation!.seats.push({
          area_id: areaId,
          subarea_id: subAreaId,
          row: s.row,
          seat: s.seat,
        });
      });
      await reservation.save();
      break;
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        continue;
      } else {
        throw error;
      }
    }
  }

  return { seats, reservation };
};

function findAvailableSeats(
  {
    start,
    rows,
  }: {
    start: number;
    rows: number[];
  },
  reservedSeats: { row: number; seat: number }[],
) {
  const availableSeats = [];

  for (let i = 0; i < rows.length; i++) {
    const row = start + i;
    const rowSeatAmount = rows[i];

    for (let seat = 1; seat <= rowSeatAmount; seat++) {
      if (!reservedSeats.find((rs) => rs.row === row && rs.seat === seat))
        availableSeats.push({ row, seat });
    }
  }

  return availableSeats;
}

function selectRandomSeats(
  selectNum: number,
  seats: { row: number; seat: number }[],
) {
  const startSeat = random(0, seats.length - selectNum);
  return seats.slice(startSeat, startSeat + selectNum);
}

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export default reserveSeats;

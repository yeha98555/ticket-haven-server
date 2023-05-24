import { InferSchemaType, Schema, model } from 'mongoose';

const seatsSchema = new Schema(
  {
    area_id: { type: Schema.Types.ObjectId, required: true },
    subarea_id: { type: Schema.Types.ObjectId, required: true },
    row: { type: Number, required: true },
    seat: { type: Number, required: true },
  },
  {
    _id: false,
  },
);

const seatReservationSchema = new Schema({
  activity_id: { type: Schema.Types.ObjectId, required: true },
  event_id: { type: Schema.Types.ObjectId, required: true },
  seats: {
    type: [seatsSchema],
    validate: (v: unknown) => Array.isArray(v) && v.length > 0,
  },
});

seatReservationSchema.index(
  {
    event_id: 1,
    'seats.area_id': 1,
    'seats.subarea_id': 1,
    'seats.row': 1,
    'seats.seat': 1,
  },
  { unique: true },
);

export type SeatReservation = InferSchemaType<typeof seatReservationSchema>;

const SeatReservationModel = model('seat_reservation', seatReservationSchema);

export default SeatReservationModel;

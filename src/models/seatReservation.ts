import { InferSchemaType, Schema, Types, model } from 'mongoose';

const seatReservationSchema = new Schema({
  activity_id: { type: Schema.Types.ObjectId, required: true },
  event_id: { type: Schema.Types.ObjectId, required: true },
  seats: {
    type: [
      {
        area_id: { type: Schema.Types.ObjectId, required: true },
        subarea_id: { type: Schema.Types.ObjectId, required: true },
        row: { type: Number, require: true },
        seat: { type: Number, require: true },
      },
    ],
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

export type ISeatReservation = InferSchemaType<typeof seatReservationSchema>;

const SeatReservationModel = model<ISeatReservation>(
  'seat_reservation',
  seatReservationSchema,
);

export default SeatReservationModel;

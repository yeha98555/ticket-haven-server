import { InferSchemaType, Schema, model } from 'mongoose';

const ticketSchema = new Schema(
  {
    ticket_no: { type: String, require: true, unique: true },
    order_id: { type: Schema.Types.ObjectId, required: true },
    activity_id: { type: Schema.Types.ObjectId, required: true },
    event_id: { type: Schema.Types.ObjectId, required: true },
    area_id: { type: Schema.Types.ObjectId, required: true },
    subarea_id: { type: Schema.Types.ObjectId, required: true },
    row: { type: Number, required: true },
    seat: { type: Number, required: true },
    price: { type: Number, required: true },
    is_used: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: 'create_at',
      updatedAt: 'update_at',
    },
  },
);

export type ITicket = InferSchemaType<typeof ticketSchema>;

const TicketModel = model<ITicket>('ticket', ticketSchema);

export default TicketModel;

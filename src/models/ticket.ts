import { InferSchemaType, Schema, Types, model } from 'mongoose';

const ticketSchema = new Schema(
  {
    ticket_no: { type: String, require: true },
    order_id: { type: Types.ObjectId, required: true },
    activity_id: { type: Types.ObjectId, required: true },
    event_id: { type: Types.ObjectId, required: true },
    area_id: { type: Types.ObjectId, required: true },
    subarea_id: { type: Types.ObjectId, required: true },
    row: { type: Number, required: true },
    seat: { type: Number, required: true },
    price: { type: Number, required: true },
    isUsed: { type: Boolean, default: false },
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

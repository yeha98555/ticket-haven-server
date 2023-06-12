import { InferSchemaType, Schema, model } from 'mongoose';

const ticketSchema = new Schema(
  {
    ticket_no: { type: String, required: true, unique: true },
    order_id: { type: Schema.Types.ObjectId, required: true, ref: 'order' },
    original_order_id: { type: Schema.Types.ObjectId, required: true },
    activity_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'activity',
    },
    event_id: { type: Schema.Types.ObjectId, required: true },
    area_id: { type: Schema.Types.ObjectId, required: true },
    subarea_id: { type: Schema.Types.ObjectId, required: true },
    row: { type: Number, required: true },
    seat: { type: Number, required: true },
    price: { type: Number, required: true },
    is_used: { type: Boolean, default: false },
    token: { type: String },
    share_code: String,
    share_code_create_at: Date,
  },
  {
    timestamps: {
      createdAt: 'create_at',
      updatedAt: 'update_at',
    },
    query: {
      byNo(ticketNo: string) {
        return this.where({ ticket_no: ticketNo });
      },
    },
  },
);

export type Ticket = InferSchemaType<typeof ticketSchema>;

const TicketModel = model('ticket', ticketSchema);

export default TicketModel;

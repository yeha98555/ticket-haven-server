import { InferSchemaType, Schema, Types, model } from 'mongoose';

const orderSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, required: true },
    activity_id: { type: Types.ObjectId, required: true },
    event_id: { type: Types.ObjectId, required: true },
    seat_reservation_id: { type: Types.ObjectId, required: true },
    order_no: { type: String, required: true, unique: true },
    transfer_from_order: Types.ObjectId,
    original_ticket_ids: [
      {
        type: Types.ObjectId,
        validate: (v: unknown) => Array.isArray(v) && v.length > 0,
      },
    ],
  },
  {
    timestamps: {
      createdAt: 'create_at',
      updatedAt: 'update_at',
    },
  },
);

export type IOrder = InferSchemaType<typeof orderSchema>;

const OrderModel = model<IOrder>('order', orderSchema);

export default OrderModel;

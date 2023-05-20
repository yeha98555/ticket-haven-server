import { InferSchemaType, Schema, Types, model } from 'mongoose';

const orderSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, required: true },
    activity_id: { type: Types.ObjectId, required: true },
    event_id: { type: Types.ObjectId, required: true },
    seats: {
      type: [
        {
          area_id: { type: Types.ObjectId, required: true },
          subarea_id: { type: Types.ObjectId, required: true },
          row: { type: Number, require: true },
          seat: { type: Number, require: true },
        },
      ],
      validate: (v: unknown) => Array.isArray(v) && v.length > 0,
    },
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

orderSchema.index(
  {
    event_id: 1,
    'seats.area_id': 1,
    'seats.subarea_id': 1,
    'seats.row': 1,
    'seats.seat': 1,
  },
  { unique: true },
);

export type IOrder = InferSchemaType<typeof orderSchema>;

const OrderModel = model<IOrder>('order', orderSchema);

export default OrderModel;

import { OrderStatus } from '@/enums/orderStatus';
import toValidate from '@/utils/toValidate';
import { InferSchemaType, Schema, model } from 'mongoose';
import { z } from 'zod';

const orderSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    activity_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'activity',
    },
    event_id: { type: Schema.Types.ObjectId, required: true },
    order_no: { type: String, required: true, unique: true },
    transfer_from_order: Schema.Types.ObjectId,
    seat_reservation_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'seat_reservation',
    },
    status: {
      type: Number,
      default: OrderStatus.UNPAID,
      validate: toValidate(z.nativeEnum(OrderStatus)),
    },
    totalPrice: { type: Number, require: true },
  },
  {
    timestamps: {
      createdAt: 'create_at',
      updatedAt: 'update_at',
    },
  },
);

export type IOrder = InferSchemaType<typeof orderSchema> & {
  create_at: Date;
  update_at: Date;
};

const OrderModel = model<IOrder>('order', orderSchema);

export default OrderModel;

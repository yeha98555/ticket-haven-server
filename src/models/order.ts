import { OrderStatus } from '@/enums/orderStatus';
import toValidate from '@/utils/toValidate';
import { InferSchemaType, Schema, Types, model } from 'mongoose';
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
    seat_reservation_id: {
      type: Schema.Types.ObjectId,
      ref: 'seat_reservation',
    },
    status: {
      type: Number,
      default: OrderStatus.PENDING,
      validate: toValidate(z.nativeEnum(OrderStatus)),
    },
    price: { type: Number, required: true },
  },
  {
    timestamps: {
      createdAt: 'create_at',
      updatedAt: 'update_at',
    },
    query: {
      byNo(orderNo: string) {
        return this.where({ order_no: orderNo });
      },
    },
  },
);

export type Order = InferSchemaType<typeof orderSchema> & {
  _id: Types.ObjectId;
  create_at: Date;
  update_at: Date;
};

const OrderModel = model('order', orderSchema);

export default OrderModel;

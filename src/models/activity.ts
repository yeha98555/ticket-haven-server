import { Region } from '@/enums/region';
import toValidate from '@/utils/toValidate';
import { InferSchemaType, Schema, Types, model } from 'mongoose';
import { z } from 'zod';

const areaSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  subareas: [
    {
      name: { type: String, required: true },
      start_row: { type: Number, required: true },
      rows: {
        type: [{ type: Number, required: true }],
        validate: (v: unknown) => Array.isArray(v) && v.length > 0,
      },
    },
  ],
});

const eventSchema = new Schema({
  sell_at: { type: Date, required: true },
  sellend_at: { type: Date, required: true },
  start_at: { type: Date, required: true },
  end_at: { type: Date, required: true },
  qrcode_verify_link: String,
});

const activitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cover_img_url: String,
    content: String,
    notice: String,
    isPublished: { type: Boolean, default: false },
    location: String,
    address: String,
    seat_big_img_url: String,
    seat_small_img_url: String,
    firm_id: { type: Types.ObjectId, required: true },
    start_at: { type: Date, required: true },
    end_at: { type: Date, required: true },
    sell_at: { type: Date, required: true },
    events: {
      type: [eventSchema],
      validate: (v: unknown) => Array.isArray(v) && v.length > 0,
    },
    region: {
      type: Number,
      validate: toValidate(z.nativeEnum(Region).optional().nullable()),
    },
    areas: {
      type: [areaSchema],
      validate: (v: unknown) => Array.isArray(v) && v.length > 0,
    },
    deleted_at: Date,
  },
  {
    timestamps: {
      createdAt: 'create_at',
      updatedAt: 'update_at',
    },
  },
);

export type IActivity = InferSchemaType<typeof activitySchema>;

const ActivityModel = model<IActivity>('activity', activitySchema);

export default ActivityModel;

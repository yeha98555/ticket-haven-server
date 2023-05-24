import { Region } from '@/enums/region';
import toValidate from '@/utils/toValidate';
import { InferSchemaType, ObjectId, Schema, Types, model } from 'mongoose';
import { z } from 'zod';

const subAreaSchema = new Schema({
  name: { type: String, required: true },
  start_row: { type: Number, required: true },
  rows: {
    type: [{ type: Number, required: true }],
    validate: (v: unknown) => Array.isArray(v) && v.length > 0,
  },
});

const areaSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  subareas: [subAreaSchema],
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
    is_published: { type: Boolean, default: false },
    location: String,
    address: String,
    seat_big_img_url: String,
    seat_small_img_url: String,
    firm_id: { type: Schema.Types.ObjectId, required: true },
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
    seat_total: {
      type: Number,
      required: true,
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

export type Activity = InferSchemaType<typeof activitySchema> & {
  _id: Types.ObjectId;
  create_at: Date;
  update_at: Date;
};

const ActivityModel = model('activity', activitySchema);

export default ActivityModel;

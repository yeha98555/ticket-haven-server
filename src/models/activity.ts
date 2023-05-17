import { InferSchemaType, Schema, Types, model } from 'mongoose';

const vipSchema = new Schema({
  early_sell_at: { type: Date, required: true },
  vip_token: [
    {
      token: { type: String, required: true, unique: true, sparse: true },
      isUsed: { type: Boolean, default: false },
    },
  ],
});

const eventSchema = new Schema({
  sell_at: { type: Date, required: true },
  sellend_at: { type: Date, required: true },
  start_at: { type: Date, required: true },
  end_at: { type: Date, required: true },
  qrcode_verify_link: String,
  vip: [vipSchema],
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
    events: [eventSchema],
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

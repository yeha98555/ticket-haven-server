import { Schema } from 'mongoose';

const vipSchema = new Schema({
  early_sell_at: { type: Date, required: true },
  vip_token: [
    {
      token: { type: String, required: true, unique: true, sparse: true },
      is_used: { type: Boolean, default: false },
    },
  ],
});

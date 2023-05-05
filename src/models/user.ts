import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    uid: String,
    username: String,
    email: String,
    phone: String,
    gender: Number,
    email_verify: Boolean,
    phone_verify: Boolean,
    password: String,
    bank_code: String,
    bank_account: String,
    avatar_url: String,
    activity_area: Number,
    delete_at: Date,
  },
  {
    timestamps: {
      createdAt: 'create_at',
      updatedAt: 'update_at',
    },
  },
);

const UserModel = model('user', userSchema);

export default UserModel;

import { Gender } from '@/enums/gender';
import toValidate from '@/utils/toValidate';
import { Schema, model } from 'mongoose';
import z from 'zod';

export interface IUser {
  uid?: string;
  username?: string;
  email?: string;
  phone?: string;
  gender?: Gender;
  email_verify?: boolean;
  phone_verify?: boolean;
  password?: string;
  bank_code?: string;
  bank_account?: string;
  avatar_url?: string;
  activity_region?: number;
  delete_at?: Date;
}

const userSchema = new Schema<IUser>(
  {
    uid: String,
    username: String,
    email: String,
    phone: String,
    gender: {
      type: Number,
      validate: toValidate(z.nativeEnum(Gender).optional().nullable()),
    },
    email_verify: Boolean,
    phone_verify: Boolean,
    password: String,
    bank_code: String,
    bank_account: String,
    avatar_url: String,
    activity_region: Number,
    delete_at: Date,
  },
  {
    timestamps: {
      createdAt: 'create_at',
      updatedAt: 'update_at',
    },
  },
);

const UserModel = model<IUser>('user', userSchema);

export default UserModel;

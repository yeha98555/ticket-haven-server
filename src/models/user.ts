import { Gender } from '@/enums/gender';
import toValidate from '@/utils/toValidate';
import { Schema, model } from 'mongoose';
import z from 'zod';

export interface IUser {
  g_uid?: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  gender?: Gender;
  email_verify?: boolean;
  phone_verify?: boolean;
  bank_code?: string;
  bank_account?: string;
  avatar_url?: string;
  activity_region?: number;
  birthday?: Date;
  delete_at?: Date;
}

const userSchema = new Schema<IUser>(
  {
    g_uid: String,
    username: {
      type: String,
      required: [true, 'username invalid'],
    },
    email: {
      type: String,
      required: [true, 'email invalid'],
    },
    phone: String,
    gender: {
      type: Number,
      validate: toValidate(z.nativeEnum(Gender).optional().nullable()),
    },
    email_verify: {
      type: Boolean,
      default: false,
    },
    phone_verify: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, 'password invalid'],
      minlength: 8,
    },
    bank_code: String,
    bank_account: String,
    avatar_url: String,
    activity_region: Number,
    birthday: Date,
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

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
  delete_at?: Date;
}

const userSchema = new Schema<IUser>(
  {
    g_uid: String,
    username: {
      type:String,
      required: [true, 'username invalid'],
      default: null,
    },
    email: {
      type: String,
      required: [true, 'email invalid'],
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    gender: {
      type: Number,
      validate: toValidate(z.nativeEnum(Gender).optional().nullable()),
      default: null,
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
      type:String,
      required: [true, 'password invalid'],
      default: null,
    },
    bank_code: {
      type: String,
      default: null,
    },
    bank_account: {
      type: String,
      default: null,
    },
    avatar_url: {
      type: String,
      default: null,
    },
    activity_region: {
      type: Number,
      dafault: null,
    },
    delete_at: {
      type: Date,
      default: null,
    },
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

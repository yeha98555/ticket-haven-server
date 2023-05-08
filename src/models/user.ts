import { Gender } from '@/enums/gender';
import toValidate from '@/utils/toValidate';
import { Schema, model } from 'mongoose';
import z from 'zod';

export interface IUser {
  uid?: string;
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
    uid: {
      type: String,
      default: null,
    },
    username: {
      type:String,
      required: [true, 'username invalid'],
      default: "",
    },
    email: {
      type: String,
      required: [true, 'email invalid'],
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
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
      type:String,
      required: [true, 'password invalid'],
    },
    bank_code: String,
    bank_account: String,
    avatar_url: String,
    activity_region: {
      type: Number,
      dafault: 1
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

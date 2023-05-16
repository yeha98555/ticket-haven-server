import UserModel, { IUser } from '@/models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { appError } from '@/services/appError';
import { StatusCode } from '@/enums/statusCode';
const saltRounds = 10;

const userService = {
  findUserById: async (id: string) => {
    const user = await UserModel.findById(id).select([
      'username',
      'email',
      'phone',
      'gender',
      'email_verify',
      'phone_verify',
      'bank_code',
      'bank_account',
      'activity_region',
      'birthday',
    ]);
    return user;
  },
  updateUserById: async (
    id: string,
    data: Partial<
      Pick<
        IUser,
        | 'username'
        | 'phone'
        | 'gender'
        | 'bank_code'
        | 'bank_account'
        | 'activity_region'
        | 'birthday'
      >
    >,
  ) => {
    const user = await UserModel.findByIdAndUpdate(id, data, {
      runValidators: true,
      new: true,
    }).select([
      'username',
      'email',
      'phone',
      'gender',
      'email_verify',
      'phone_verify',
      'bank_code',
      'bank_account',
      'activity_region',
      'birthday',
    ]);
    return user;
  },
  signin: async ({ email, password }: { email: string; password: string }) => {
    const foundUser = await UserModel.findOne({ email });
    if (!foundUser) throw appError(400, StatusCode.NOT_FOUND, 'Invalid request');
    const result = await bcrypt.compare(password, foundUser.password);
    if (!result) throw appError(400, StatusCode.FAIL, 'Invalid request');
    const tokenObj = { id: foundUser._id, email: foundUser.email };
    const SECRET: string = process.env.JWT_SECRET;
    const token = jwt.sign(tokenObj, SECRET, { expiresIn: '1d' });
    return `Bearer ${token}`;
  },
  signup: async (req: {
    username: string;
    email: string;
    password: string;
  }) => {
    const { username, email, password } = req;
    const isExistUser = await UserModel.findOne({ email });
    if (isExistUser) throw appError(400, StatusCode.FAIL, 'Email already exists');
    const hash = await bcrypt.hash(password, saltRounds);
    const newUser = new UserModel({ username, email, password: hash });
    await newUser.save();
    return true;
  },
};

export default userService;

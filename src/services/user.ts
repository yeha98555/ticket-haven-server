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
    try {
      const foundUser = await UserModel.findOne({ email });
      if (!foundUser) throw appError(400, StatusCode.NOT_FOUND, '帳號不存在！');

      const result = await bcrypt.compare(password, foundUser.password);
      if (!result) throw appError(400, StatusCode.FORBIDDEN, '帳號/密碼錯誤！');

      const tokenObj = { id: foundUser._id, email: foundUser.email };
      const SECRET: string = process.env.JWT_SECRET;
      const token = jwt.sign(tokenObj, SECRET, { expiresIn: '1d' });
      const res = {
        status: 200,
        statusCode: StatusCode.SUCCESS,
        message: '登入成功！',
        token: `Bearer ${token}`,
      };
      return res;
    } catch (err) {
      console.log('signup',err);
      throw err;
    }
  },
  signup: async (req: {
    username: string;
    email: string;
    password: string;
  }) => {
    const { username, email, password } = req;
    const isExistUser = await UserModel.findOne({ email });
    if (isExistUser) throw appError(400, StatusCode.FORBIDDEN, '此帳號已存在，請重新輸入！');
    try {
      const hash = await bcrypt.hash(password, saltRounds);
      const newUser = new UserModel({ username, email, password: hash });
      await newUser.save();
      await UserModel.find({}).then((data) => console.log(data));
      const res = {
        status: 200,
        statusCode: StatusCode.SUCCESS,
        message: '註冊成功，請重新登入',
      };
      return res;
    } catch (err) {
      console.log(err);
      throw appError(500, StatusCode.SERVER_ERROR, '發生錯誤，請稍後再試');
    }
  },
};

export default userService;

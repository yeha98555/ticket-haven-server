import UserModel, { User } from '@/models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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
        User,
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
    let token = '';
    const foundUser = await UserModel.findOne({ email });
    if (foundUser) {
      const passwordCorrect = await bcrypt.compare(
        password,
        foundUser.password,
      );
      if (passwordCorrect) {
        const tokenObj = { id: foundUser._id, email: foundUser.email };
        const SECRET: string = process.env.JWT_SECRET;
        token = `Bearer ${jwt.sign(tokenObj, SECRET, { expiresIn: '1d' })}`;
      }
    }
    return token;
  },
  signup: async (req: {
    username: string;
    email: string;
    password: string;
  }) => {
    const { username, email, password } = req;
    const isExistUser = await UserModel.findOne({ email });
    if (isExistUser) return false;
    const hash = await bcrypt.hash(password, saltRounds);
    const newUser = new UserModel({ username, email, password: hash });
    await newUser.save();
    return true;
  },
};

export default userService;

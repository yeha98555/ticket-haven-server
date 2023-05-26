import { PermissionDeniedException } from '@/exceptions/PermissionDeniedException';
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
    const user = await UserModel.findOne({ email });
    if (!user) throw new PermissionDeniedException();

    const isPwdCorrect = await bcrypt.compare(password, user.password);
    if (!isPwdCorrect) throw new PermissionDeniedException();

    const payload = { id: user._id, email: user.email };
    const secret = process.env.JWT_SECRET;
    token = jwt.sign(payload, secret, { expiresIn: '1d' });

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

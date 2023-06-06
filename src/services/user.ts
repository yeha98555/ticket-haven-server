import UserModel, { User } from '@/models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const saltRounds = 10;

export type MailOptions = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
};

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
  generateVerifyToken: async (payload: string | object | Buffer) => {
    const verifyToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
    return verifyToken;
  },
  sendVerificationEmail: async (mailOptions: MailOptions) => {
    const clientId = process.env.GOOGLE_AUTH_CLIENTID;
    const clientSecret = process.env.GOOGLE_AUTH_CLIENT_SECRET;
    const redirectUrl = process.env.GOOGLE_REDIRECT_URL;
    const refreshToken = process.env.GOOGLE_AUTH_REFRESH_TOKEN;
    const userMail = process.env.USER_MAIL;

    const oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUrl,
    );
    oAuth2Client.setCredentials({ refresh_token: refreshToken });

    const { token: accessToken } = await oAuth2Client.getAccessToken();

    const smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: userMail,
        clientId,
        clientSecret,
        refreshToken,
        accessToken: accessToken || '',
      },
    });

    let result;
    try {
      result = await smtpTransport.sendMail(mailOptions);
    } catch {
      throw new Error('Error sending email');
    } finally {
      smtpTransport.close();
    }
    return result;
  },
};

export default userService;

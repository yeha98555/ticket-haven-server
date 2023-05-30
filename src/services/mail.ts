import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import { generateVerificationCode } from '@/utils/comm';

type MailOptions = {
  from: string;
  to: string | string[];
  subject: string;
  text: string;
};

const clientId = process.env.GOOGLE_AUTH_CLIENTID;
const clientSecret = process.env.GOOGLE_AUTH_CLIENT_SECRET;
const redirectUrl = process.env.GOOGLE_REDIRECT_URL;
const refreshToken = process.env.GOOGLE_AUTH_REFRESH_TOKEN;
const userMail = process.env.USER_MAIL;

const sendMail = async (mailOptions: MailOptions) => {
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
};

const sendVerificationCode = async (email: string) => {
  const verificationCode = generateVerificationCode(6);

  // TODO: save verification code to redis/db

  const mailOptions = {
    from: userMail,
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is ${verificationCode}`,
  };

  const result = await sendMail(mailOptions);
  return { result, verificationCode };
};

const mailService = {
  sendMail,
  sendVerificationCode,
};

export default mailService;

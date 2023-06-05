import jwt from 'jsonwebtoken';
import { decamelizeKeys } from 'humps';
import userService from '@/services/user';
import catchAsyncError from '@/utils/catchAsyncError';
import { Body } from '@/utils/response';
import { Request, Response, NextFunction } from 'express';
import { appError } from '@/services/appError';
import { StatusCode } from '@/enums/statusCode';
import { User } from '@/models/user';

const userController = {
  signup: catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const isSignup = await userService.signup(req.body);
        if (!isSignup)
          throw appError(400, StatusCode.FAIL, 'User already exists');
        res.status(200).json(Body.success(''));
      } catch (error) {
        next(error);
      }
    },
  ),
  signin: catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const token = await userService.signin(req.body);
        if (!token) throw appError(400, StatusCode.FAIL, 'Invalid request');
        res.status(200).json(Body.success({ token }));
      } catch (error) {
        next(error);
      }
    },
  ),

  getUser: catchAsyncError(async (req: Request, res: Response) => {
    const user = await userService.findUserById(req.userId!);
    res.json(Body.success(user?.toJSON({ virtuals: true })));
  }),

  updateUser: catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await userService.updateUserById(
        req.userId!,
        decamelizeKeys(req.body),
      );
      res.json(Body.success(user?.toJSON({ virtuals: true })));
    },
  ),
  sendVerificationEmail: catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = (await userService.findUserById(req.userId!)) as User;
        if (!user) throw appError(400, StatusCode.FAIL, 'User not found');

        const verifyToken = await userService.generateVerifyToken({
          id: user._id,
          email: user.email,
          verifyType: 'email',
        });
        const mailOptions = {
          from: `Ticket Haven ${process.env.USER_MAIL}`,
          to: user.email,
          subject: 'Please verify your email',
          html: `<div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Welcome to Ticket Haven!</h2>
          <p>Dear ${user.username},</p>
          <p>Thank you for creating an account with us. To complete your registration, please click the button below to verify your email address:</p>
          <div style="margin: 2em 0;">
            <a href="${process.env.APP_URL}/user/verify/${verifyToken}"
               style="background-color: #007BFF; color: white; text-decoration: none; padding: 10px 20px; border-radius: 3px;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, you can also copy the following link and paste it into your web browser:</p>
          <p><a href="${process.env.APP_URL}/user/verify/${verifyToken}">${process.env.APP_URL}/user/verify/${verifyToken}</a></p>
          <p>If you didn't sign up for Ticket Haven, you can ignore this email. If you have any questions, feel free to reply to this email.</p>
          <p>Best regards,</p>
          <p>The Ticket Haven Team</p>
        </div>`,
        };
        await userService.sendVerificationEmail(mailOptions);
        res.status(200).json(Body.success(''));
      } catch (error) {
        next(error);
      }
    },
  ),
  verify: catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.params.token;

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { id, email, phone, verifyType } = decoded as {
          id: string;
          email?: string;
          phone?: string;
          verifyType: 'email' | 'phone';
        };

        const user = await userService.findUserById(id);
        if (!user) {
          throw appError(400, StatusCode.FAIL, 'Invalid request');
        }

        let verifyField: string | undefined,
          userField: string | undefined,
          isVerified: boolean;
        if (verifyType === 'email') {
          verifyField = email;
          userField = user.email;
          isVerified = !!user.email_verify;
        } else if (verifyType === 'phone') {
          verifyField = phone;
          userField = user.phone;
          isVerified = !!user.phone_verify;
        } else {
          throw appError(400, StatusCode.FAIL, 'Invalid request');
        }

        if (!verifyField || userField !== verifyField) {
          throw appError(400, StatusCode.FAIL, 'Invalid request');
        }

        if (!isVerified) {
          if (verifyType === 'email') {
            user.email_verify = true;
          } else if (verifyType === 'phone') {
            user.phone_verify = true;
          }
          await userService.updateUserById(id, user);
        }

        res.status(200).json(Body.success('Verified successfully'));
      } catch (error) {
        next(error);
      }
    },
  ),
};

export default userController;

import userController from '@/controllers/user';
import { Router } from 'express';
import z from 'zod';
import { Gender } from '@/enums/gender';
import { isAuth } from '@/middleware/auth';
import {
  validateRequest,
  validateRequestParams,
} from '@/middleware/paramsValidator';

const userRouter = Router();

userRouter.post('/signup', userController.signup);

userRouter.get(
  '/send-verification/email',
  isAuth,
  userController.sendVerificationEmail,
);

userRouter.get(
  '/verify/:token',
  validateRequestParams(z.object({ token: z.string() })),
  userController.verify,
);

userRouter.post('/signin', userController.signin);

userRouter.get('/', isAuth, userController.getUser);

userRouter.patch(
  '/',
  isAuth,
  validateRequest({
    body: z.object({
      username: z.string().optional(),
      phone: z.string().optional(),
      gender: z.nativeEnum(Gender).optional(),
      emailVerify: z.boolean().optional(),
      phoneVerify: z.boolean().optional(),
      password: z.string().optional(),
      bankCode: z.string().optional(),
      bankAccount: z.string().optional(),
      activityRegion: z.number().optional(),
      birthday: z.coerce.date().optional(),
    }),
  }),
  userController.updateUser,
);

export default userRouter;

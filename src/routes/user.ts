import userController from '@/controllers/user';
import { Router } from 'express';
import { validateRequest } from 'zod-express-middleware';
import z from 'zod';
import { Gender } from '@/enums/gender';
import { isAuth } from '@/middleware/auth';

const userRouter = Router();

userRouter.get('/', isAuth, userController.getUser);

userRouter.patch(
  '/',
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
    }),
  }),
  isAuth,
  userController.updateUser,
);

export default userRouter;

import userController from '@/controllers/user';
import { Router } from 'express';
import { validateRequest } from 'zod-express-middleware';
import z from 'zod';
import { Gender } from '@/enums/gender';

const userRouter = Router();

userRouter.get('/', userController.getUser);

userRouter.patch(
  '/',
  validateRequest({
    body: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
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
  userController.updateUser,
);

export default userRouter;

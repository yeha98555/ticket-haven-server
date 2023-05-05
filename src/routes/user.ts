import userController from '@/controllers/user';
import { Router } from 'express';

const userRouter = Router();

userRouter.get('/', userController.getUser);

export default userRouter;

import userService from '@/services/user';
import catchAsyncError from '@/utils/catchAsyncError';
import { Body } from '@/utils/response';
import { Request, Response, NextFunction } from 'express';
import { decamelizeKeys } from 'humps';

const userController = {
  signup: async (req: Request, res: Response) => {
    try {
      const result = await userService.signup(req.body);
      res.status(result.status);
      res.send(result);
    } catch (error) {
      res.status(500);
      res.send({ message: '好像哪裡出錯了!' });
    }
  },
  signin: async (req: Request, res: Response) => {
    try {
      const result = await userService.signin(req.body);
      res.status(result.status);
      res.send(result);
    } catch (error) {
      res.status(500);
      res.send({ message: '好像哪裡出錯了!' });
    }
  },

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
};

export default userController;

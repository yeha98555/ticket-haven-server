import userService from '@/services/user';
import catchAsyncError from '@/utils/catchAsyncError';
import { Body } from '@/utils/response';
import { Request, Response, NextFunction } from 'express';
import { decamelizeKeys } from 'humps';

const userController = {
  signup: async (req: Request, res: Response, next: NextFunction,) => {
    try {
      const result = await userService.signup(req.body);
      console.log(result);
      res.status(result.status);
      res.send(result);
    } catch (error) {
      next(error);
    }
  },
  signin: async (req: Request, res: Response, next: NextFunction,) => {
    try {
      const result = await userService.signin(req.body);
      const {status, message, token } = result
      console.log(result);
      res.status(status);
      res.send(successBody({message, data: {token}}));
    } catch (error) {
      next(error);
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

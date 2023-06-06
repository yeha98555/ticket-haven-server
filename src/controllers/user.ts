import userService from '@/services/user';
import catchAsyncError from '@/utils/catchAsyncError';
import { Body } from '@/utils/response';
import { Request, Response, NextFunction } from 'express';
import { appError } from '@/services/appError';
import { StatusCode } from '@/enums/statusCode';
import { decamelizeKeys } from 'humps';

const userController = {
  signup: catchAsyncError(async (req: Request, res: Response, next: NextFunction,) => {
    try {
      const isSignup = await userService.signup(req.body);
      if(!isSignup) throw appError(400, StatusCode.FAIL, 'User already exists');
      res.status(200).json(Body.success(''));
    } catch (error) {
      next(error);
    }
  }),
  signin: catchAsyncError(async (req: Request, res: Response, next: NextFunction,) => {
    try {
      const token = await userService.signin(req.body);
      if(!token) throw appError(400, StatusCode.FAIL, 'Invalid request');
      res.status(200).json(Body.success({token}));
    } catch (error) {
      next(error);
    }
  }),

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

import userService from '@/services/user';
import { successBody } from '@/utils/response';
import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '@/middleware/auth';
import { appError } from '@/services/appError';
import { StatusCode } from '@/enums/statusCode';
import { camelizeKeys, decamelizeKeys } from 'humps';

const userController = {
  signup: async (req: Request, res: Response, next: NextFunction,) => {
    try {
      const isSignup = await userService.signup(req.body);
      if(isSignup){
        res.status(200).send({
          statusCode: StatusCode.SUCCESS,
          message: '註冊成功，請重新登入',
        });
      }
    } catch (error) {
      next(error);
    }
  },
  signin: async (req: Request, res: Response, next: NextFunction,) => {
    try {
      const token = await userService.signin(req.body);
      if(token){
        res.status(200).send({
          statusCode: StatusCode.SUCCESS,
          message: 'Success',
          token,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  getUser: async (req: RequestWithUser, res: Response) => {
    const user = await userService.findUserById(req.userId!);
    res.send(
      successBody({ data: camelizeKeys(user?.toJSON({ virtuals: true })) }),
    );
  },

  updateUser: async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = await userService.updateUserById(
        req.userId!,
        decamelizeKeys(req.body),
      );

      res.json(
        successBody({ data: camelizeKeys(user?.toJSON({ virtuals: true })) }),
      );
    } catch (error) {
      const err = appError(400, StatusCode.FAIL, 'Parameter error');
      next(err);
    }
  },
};

export default userController;

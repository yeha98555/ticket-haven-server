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

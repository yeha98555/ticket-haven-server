import userService from '@/services/user';
import { successBody } from '@/utils/response';
import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '@/middleware/auth';
import { appError } from '@/services/appError';
import { StatusCode } from '@/enums/statusCode';
import { camelizeKeys, decamelizeKeys } from 'humps';

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

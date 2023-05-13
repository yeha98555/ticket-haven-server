import userService from '@/services/user';
import { successBody } from '@/utils/response';
import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '@/middleware/auth';
import { appError } from '@/services/appError';
import { StatusCode } from '@/enums/statusCode';

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
    res.send(successBody({ data: user }));
  },

  updateUser: async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const body = req.body;

    try {
      const user = await userService.updateUserById(req.userId!, {
        username: body.username,
        phone: body.phone,
        gender: body.gender,
        bank_code: body.bankCode,
        bank_account: body.bankAccount,
        activity_region: body.activityRegion,
      });

      res.json(successBody({ data: user }));
    } catch (error) {
      const err = appError(400, StatusCode.FAIL, 'Parameter error');
      next(err);
    }
  },
};

export default userController;

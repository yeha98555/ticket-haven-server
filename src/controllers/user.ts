import userService from '@/services/user';
import { successBody } from '@/utils/response';
import { Response, NextFunction } from 'express';
import { RequestWithUser } from '@/middleware/auth';
import { appError } from '@/services/appError';
import { StatusCode } from '@/enums/statusCode';

const userController = {
  getUser: async (req: RequestWithUser, res: Response) => {

    if (req.userId) {
      const user = await userService.findUserById(req.userId);
      res.send(successBody({ data: user }));
    }
  },

  updateUser: async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (req.userId) {
      const body = req.body;

      try {
        const user = await userService.updateUserById(req.userId, {
          username: body.username,
          phone: body.phone,
          gender: body.gender,
          bank_code: body.bankCode,
          bank_account: body.bankAccount,
          activity_region: body.activityRegion,
        });

        res.json(successBody({ data: user }));
      } catch (error) {
        const err = appError(400, StatusCode.Fail, 'Parameter error');
        next(err);
      }
    }
  },
};

export default userController;

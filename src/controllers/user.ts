import userService from '@/services/user';
import { successBody } from '@/utils/response';
import { Request, Response } from 'express';
import { RequestWithUser } from '@/middleware/auth';

const userController = {
  getUser: async (req: RequestWithUser, res: Response) => {

    if (req.userId) {
      const user = await userService.findUserById(req.userId);
      res.send(successBody({ data: user }));
    }
  },

  updateUser: async (req: RequestWithUser, res: Response) => {
    const token = req.headers.authorization;

    if (req.userId) {
      const body = req.body;

      // TODO: 更新錯誤處理方法
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
        res.status(400);
        res.json({
          status: '0002',
          message: 'Parameter error',
        });
      }
    }
  },
};

export default userController;

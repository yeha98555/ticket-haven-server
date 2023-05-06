import userService from '@/services/user';
import { successBody } from '@/utils/response';
import { Request, Response } from 'express';

const parseToken = (token: string) => '644e3f3afc13ae317e842dd1';

const userController = {
  getUser: async (req: Request, res: Response) => {
    const token = req.headers.authorization;

    if (token) {
      // TODO: 使用真正的 user id
      const userId = parseToken(token);
      const user = await userService.findUserById(userId);
      res.send(successBody({ data: user }));
    } else {
      res.status(401);
      // TODO: 更新錯誤訊息定義的方式
      res.json({
        status: '0001',
        message: 'Permission Deined',
      });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    const token = req.headers.authorization;

    if (token) {
      const userId = parseToken(token);
      const body = req.body;

      // TODO: 更新錯誤處理方法
      try {
        const user = await userService.updateUserById(userId, {
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
    } else {
      res.status(401);
      res.json({
        status: '0001',
        message: 'Permission Deined',
      });
    }
  },
};

export default userController;

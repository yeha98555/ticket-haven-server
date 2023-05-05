import userService from '@/services/user';
import { Request, Response } from 'express';

const parseToken = (token: string) => '644e3f3afc13ae317e842dd1';

const userController = {
  // TODO: 需要更新token解析方式
  getUser: async (req: Request, res: Response) => {
    const token = req.headers.authorization;

    if (token) {
      // TODO: 使用真正的 user id
      const userId = parseToken(token);
      const user = await userService.findUserById(userId);
      res.json(user);
    } else {
      res.status(401);
      // TODO: 更新錯誤訊息定義的方式
      res.json({
        status: '0001',
        message: 'Permission Deined',
      });
    }
  },
};

export default userController;

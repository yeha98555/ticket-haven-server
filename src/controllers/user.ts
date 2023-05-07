import { Request, Response } from 'express';
import userService from '@/services/user'

const userController = {
  signup: async (req: Request, res: Response) => {
    try {
      const data = await userService.signup(req.body);
      res.status(200);
      res.send(data);
    } catch (error) {
      res.status(500);
      res.send({ message: '好像哪裡出錯了!' });
    }
  },
  signin: async (req: Request, res: Response) => {
    try {
      const data = await userService.signin(req.body);
      res.status(200);
      res.send(data);
    } catch (error) {
      res.status(500);
      res.send({ message: '好像哪裡出錯了!' });
    }
  }
}

export default userController;

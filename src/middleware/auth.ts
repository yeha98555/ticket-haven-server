
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userService from '@/services/user';

interface Payload {
  id: string;
}

export interface RequestWithUser extends Request {
  userId?: string;
}

export const isAuth = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  let token: string | undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // TODO: error處理
    return next('未填寫Token');
  }

  // check token accuracy
  const decoded = await new Promise<Payload>((resolve, reject) => {
    jwt.verify(token!, process.env.JWT_SECRET!, (err, payload) => {
      if (err) {
        // TODO: error處理
        // reject(err);
      } else {
        resolve(payload as Payload);
      }
    });
  });
  // check userId exist
  const currentUser = await userService.findUserById(decoded.id);
  if (currentUser) {
    req.userId = currentUser._id.toString();
  } else {
    // TODO: error處理
    // reject("用戶不存在");
  }
  next();
};

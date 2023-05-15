import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userService from '@/services/user';
import { appError } from '@/services/appError';
import { StatusCode } from '@/enums/statusCode';

interface Payload {
  id: string;
  email: string;
}

export interface RequestWithUser extends Request {
  userId?: string;
}

export const isAuth = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  let token: string | undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const err = appError(401, StatusCode.FORBIDDEN, 'Permission Deined'); // 未傳送Token
    return next(err);
  }

  try {
    // check token accuracy
    const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as Payload;

    // check userId exist
    const currentUser = await userService.findUserById(decoded.id);

    if (currentUser) {
      req.userId = currentUser._id.toString();
      return next();
    }

    const err = appError(401, StatusCode.FORBIDDEN, 'Permission Deined'); // 用戶不存在
    return next(err);
  } catch (error) {
    const err = appError(401, StatusCode.FORBIDDEN, 'Permission Deined'); // Token錯誤
    return next(err);
  }
};

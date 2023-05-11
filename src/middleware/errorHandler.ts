import { StatusCode } from '@/enums/statusCode';
import { HttpException } from '@/exceptions/HttpException';
import { logError } from '@/services/logger';
import { NextFunction, Request, Response } from 'express';

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof HttpException) {
    res.status(err.status);
    res.json({
      status: err.statusCode,
      message: err.message,
    });
    logError(err, 'info');
  } else {
    if (!(err instanceof Error)) {
      err = new Error(`Server error: ${err}`);
    }
    res.status(500);
    res.json({
      status: StatusCode.SERVER_ERROR,
      message: '系統錯誤，請聯繫系統管理員。',
    });
    logError(err as Error);
  }
  next(err);
};

export default errorHandler;

import { StatusCode } from '@/enums/statusCode';
import { HttpException } from '@/exceptions/HttpException';

export const appError = (
  httpCode: number,
  statusCode: StatusCode,
  errMessage: string,
  data?: unknown,
) => {
  const err = new HttpException({
    httpCode,
    statusCode,
    message: errMessage,
    data,
  });
  return err;
};

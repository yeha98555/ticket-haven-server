import { StatusCode } from "@/enums/statusCode";
import { HttpException } from "@/exceptions/HttpException";

export const appError = (httpCode: number, statusCode: StatusCode, errMessage: string) => {
  const err = new HttpException({
    httpCode: httpCode,
    statusCode: statusCode,
    message: errMessage
  });
  return err;
};
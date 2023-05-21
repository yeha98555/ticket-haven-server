import { StatusCode } from '@/enums/statusCode';
import { HttpException } from './HttpException';

export class RequestParamsException extends HttpException {
  constructor(data: unknown) {
    super({
      httpCode: 400,
      statusCode: StatusCode.UNAVAILABLE_REQUEST_PARAMETER,
      message: 'unavailable request parameters',
      data,
    });
  }
}

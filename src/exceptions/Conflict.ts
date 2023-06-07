import { StatusCode } from '@/enums/statusCode';
import { HttpException } from './HttpException';

export class ConflictException extends HttpException {
  constructor(message = '') {
    super({
      httpCode: 409,
      statusCode: StatusCode.CONFLICT,
      message,
    });
  }
}

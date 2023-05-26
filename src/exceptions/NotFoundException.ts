import { StatusCode } from '@/enums/statusCode';
import { HttpException } from './HttpException';

export class NotFoundException extends HttpException {
  constructor(message = 'Not Found') {
    super({
      httpCode: 404,
      statusCode: StatusCode.NOT_FOUND,
      message,
    });
  }
}

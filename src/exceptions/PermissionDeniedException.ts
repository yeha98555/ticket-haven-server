import { StatusCode } from '@/enums/statusCode';
import { HttpException } from './HttpException';

export class PermissionDeniedException extends HttpException {
  constructor() {
    super({
      httpCode: 401,
      statusCode: StatusCode.FORBIDDEN,
      message: 'Permission Denied',
    });
  }
}

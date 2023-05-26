import { StatusCode } from '@/enums/statusCode';
import { HttpException } from './HttpException';

export class OrderCannotModifyException extends HttpException {
  constructor() {
    super({
      httpCode: 409,
      statusCode: StatusCode.ORDER_CANNOT_MODIFY,
      message: '訂單不可修改',
    });
  }
}

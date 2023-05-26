import { StatusCode } from '@/enums/statusCode';
import { HttpException } from './HttpException';

export class OrderNoSeatsException extends HttpException {
  constructor() {
    super({
      httpCode: 409,
      statusCode: StatusCode.ORDER_NO_SEATS,
      message: '訂單不可無座位',
    });
  }
}

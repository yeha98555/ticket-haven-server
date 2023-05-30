import { StatusCode } from '@/enums/statusCode';
import { HttpException } from './HttpException';

export class OrderExceedSeatLimitException extends HttpException {
  constructor() {
    super({
      httpCode: 409,
      statusCode: StatusCode.ORDER_EXCEEDS_SEATS_LIMIT,
      message: '選取座位數超過上限',
    });
  }
}

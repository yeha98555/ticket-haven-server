import { StatusCode } from '@/enums/statusCode';
import { HttpException } from './HttpException';

export class RemainingSeatsInsufficientException extends HttpException {
  constructor() {
    super({
      httpCode: 409,
      statusCode: StatusCode.REMAINING_SEATS_INSUFFICIENT,
      message: '剩餘座位數不足',
    });
  }
}

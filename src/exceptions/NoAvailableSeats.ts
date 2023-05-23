import { StatusCode } from '@/enums/statusCode';
import { HttpException } from './HttpException';

export class NoAvailableSeatsException extends HttpException {
  constructor() {
    super({
      httpCode: 409,
      statusCode: StatusCode.NO_AVAILABLE_SEATS,
      message: 'no available seats',
    });
  }
}

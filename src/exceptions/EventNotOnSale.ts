import { StatusCode } from '@/enums/statusCode';
import { HttpException } from './HttpException';

export class EventNotOnSaleException extends HttpException {
  constructor() {
    super({
      httpCode: 400,
      statusCode: StatusCode.EVENT_NOT_ON_SALE,
      message: '活動不在售票時間內',
    });
  }
}

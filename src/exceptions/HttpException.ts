import { StatusCode } from '@/enums/statusCode';

interface HttpError {
  httpCode: number;
  statusCode: StatusCode;
  message: string;
}

export class HttpException extends Error {
  public readonly status: number;
  public readonly statusCode: string;

  constructor(args: HttpError) {
    super(args.message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.status = args.httpCode;
    this.statusCode = args.statusCode;
  }
}

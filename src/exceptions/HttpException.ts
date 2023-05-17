import { StatusCode } from '@/enums/statusCode';

export interface HttpErrorArgs {
  httpCode: number;
  statusCode: StatusCode;
  message: string;
  data?: unknown;
}

export class HttpException extends Error {
  status: number;
  statusCode: string;
  data: unknown;

  constructor(args: HttpErrorArgs) {
    super(args.message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.status = args.httpCode;
    this.statusCode = args.statusCode;
    this.data = args.data;
  }
}

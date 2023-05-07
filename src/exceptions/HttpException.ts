import { StatusCode } from '@/enums/statusCode';

interface HttpError {
  httpCode: number;
  statusCode: StatusCode;
  message: string;
  isOperational?: boolean;
}

export class HttpException extends Error {
  public readonly status: number;
  public readonly statusCode: string;
  public readonly isOperational: boolean = true;

  constructor(args: HttpError) {
    super(args.message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.status = args.httpCode;
    this.statusCode = args.statusCode;

    if (args.isOperational !== undefined) {
      this.isOperational = args.isOperational;
    }

    // Error.captureStackTrace(this);
  }
}

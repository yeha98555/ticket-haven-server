import './connections';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';

import { HttpException } from './exceptions/HttpException';
import indexRouter from './routes/index';
import { StatusCode } from './enums/statusCode';
import { appError } from './services/appError';
import logger, { logError } from './services/logger';

const app: express.Application = express();

app.use(cors());

// log success request
app.use(
  morgan('dev', {
    skip: (req, res) => res.statusCode >= 500,
    stream: { write: (message) => logger.http(message.trim()) },
  }),
);

// fail success request
app.use(
  morgan('dev', {
    skip: (req, res) => res.statusCode < 500,
    stream: { write: (message) => logger.error(message.trim()) },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  const err = appError(404, StatusCode.NOT_FOUND, 'NOT FOUND');
  next(err);
});

// error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (!(err instanceof Error)) {
    err = new Error(`Server error: ${err}`);
  }
  if (err instanceof HttpException) {
    res.status(err.status);
    res.json({
      status: err.statusCode,
      message: err.message,
    });
  } else if (err instanceof Error) {
    res.status(500);
    res.json({
      status: StatusCode.SERVER_ERROR,
      message: '系統錯誤，請聯繫系統管理員。',
    });
    logError(err);
  }
});

export default app;

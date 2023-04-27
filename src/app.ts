import express, { Request, Response, NextFunction } from 'express';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { HttpException } from './exceptions/HttpException';
import indexRouter from './routes/index';

import './connections';

const app: express.Application = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new HttpException(404, 'Not Found');
  next(err);
});

// error handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpException) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send('error');
  }
  next(err);
});

export default app;

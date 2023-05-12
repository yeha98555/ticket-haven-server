import './connections';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';

import indexRouter from './routes/index';
import { StatusCode } from './enums/statusCode';
import { appError } from './services/appError';
import logger from './services/logger';
import errorHandler from './middleware/errorHandler';

const app: express.Application = express();

app.use(cors());

const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
// log success request
app.use(
  morgan(morganFormat, {
    skip: (req, res) => res.statusCode >= 500,
    stream: { write: (message) => logger.http(message.trim()) },
  }),
);

// log fail request
app.use(
  morgan(morganFormat, {
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

app.use(errorHandler);

export default app;

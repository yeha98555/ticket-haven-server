import path from 'path';
import winston, { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const fileTransport: DailyRotateFile = new DailyRotateFile({
  filename: path.join(process.env.LOG_FILE_PATH, '%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  format: format.combine(
    format.uncolorize(),
    format.timestamp(),
    format.printf((info) => {
      return `${info.timestamp} ${info.level}: ${info.message}`;
    }),
  ),
  maxSize: '20m',
  maxFiles: '14d',
});

const httpConsoleTransport = new winston.transports.Console({
  format: format.combine(
    format.colorize(),
    format.printf((info) => {
      return `${info.level}: ${info.message}`;
    }),
  ),
});

const logger = winston.createLogger({
  level: 'http',
  transports: [
    fileTransport,
    process.env.NODE_ENV === 'development' && httpConsoleTransport,
  ].filter(Boolean) as winston.transport[],
});

export const logError = (err: Error, level = 'error') => {
  logger.log({
    level,
    message: `${err.message} \n ${err.stack}`,
  });
};

export default logger;

import path from 'path';
import winston, { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const ConsoleTransport = new winston.transports.Console({
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
    process.env.NODE_ENV === 'development' && ConsoleTransport,
  ].filter(Boolean) as winston.transport[],
});

if (process.env.LOG_FILE_DIR) {
  const fileTransport: DailyRotateFile = new DailyRotateFile({
    filename: path.join(process.env.LOG_FILE_DIR, '%DATE%.log'),
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
  logger.add(fileTransport);
}

export const logError = (err: Error, level = 'error') => {
  logger.log({
    level,
    message: `${err.message} \n ${err.stack}`,
  });
};

export default logger;

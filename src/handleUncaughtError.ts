import logger, { logError } from './services/logger';

process.on('uncaughtException', (err) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(err);
  }
  logError(err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(reason);
  }
  if (reason instanceof Error) {
    logError(reason);
  } else {
    logger.error(`${reason}`);
  }
});

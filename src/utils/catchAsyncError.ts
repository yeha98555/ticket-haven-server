import { RequestHandler } from 'express';

const catchAsyncError = (func: RequestHandler): RequestHandler => {
  return async (req, res, next) => {
    try {
      await func(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default catchAsyncError;

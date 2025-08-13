import { NextFunction, Request, RequestHandler, Response } from 'express';

const catchAsync = (asyncFn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await asyncFn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default catchAsync;

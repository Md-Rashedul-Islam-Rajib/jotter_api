import { Request, Response } from 'express';

// Define the notFound middleware
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    message: 'The requested resource was not found.',
    path: req.originalUrl,
  });
};

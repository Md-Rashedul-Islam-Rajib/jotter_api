import mongoose, { MongooseError } from 'mongoose';
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ValidationErrorResponse } from '../types/error.types';

export const handleErrors: ErrorRequestHandler = (err, _req, res, _next) => {
  // handling mongoose errors
  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      message: err.message || 'Validation failed',
      statusCode: 400,
      error: {
        details: {
          name: err.name,
          errors: err.errors,
        },
      },
      stack: err.stack,
    } as ValidationErrorResponse);
  }

  // handling cast errors
  if (err instanceof MongooseError) {
    if (err?.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid ObjectId',
        statusCode: 400,
        error: {
          name: err.name,
          errors: err,
        },
        stack: err.stack,
      });
    }
  }
  // handling zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: err.name,
      statusCode: 400,
      error: {
        name: err.name,
        errors: err.errors || err.issues,
      },
      stack: err.stack,
    });
  }

  // handling all other errors except zod and mongoose
  if (err instanceof Error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      statusCode: 400,
      error: err.message,
      stack: err.stack,
    });
  }

  // handling unknown errors
  res.status(500).json({
    success: false,
    message: 'Unknown error occurs',
    statusCode: 400,
    error: JSON.stringify(err),
  });
};

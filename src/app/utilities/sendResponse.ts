import type { Response } from 'express';

/**
 *
 * @param res Response from Express.js from the Specific Controller
 * @param statusCode HTTP Status Code
 * @param success Success Response as boolean (`true` or `false`)
 * @param message Custom Message Message
 * @param data Optional Data to send
 */
const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
): void => {
  if (data) {
    res.status(statusCode).json({
      success,
      message,
      statusCode,
      data,
    });
  } else {
    res.status(statusCode).json({
      success,
      message,
      statusCode,
    });
  }
};

export default sendResponse;

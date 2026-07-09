import { Response } from 'express';

export function sendResponse<T>(
  res: Response,
  statusCode: number,
  data: T,
  message = 'Success',
  meta?: Record<string, unknown>
) {
  return res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

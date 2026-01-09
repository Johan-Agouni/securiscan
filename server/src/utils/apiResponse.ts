import { Response } from 'express';

interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  success?: boolean;
  data?: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export function apiResponse<T>({
  res,
  statusCode = 200,
  success = true,
  data,
  message,
  meta,
}: ApiResponseOptions<T>) {
  return res.status(statusCode).json({
    success,
    message,
    data,
    meta,
  });
}

export function apiError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: Record<string, string[]>
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

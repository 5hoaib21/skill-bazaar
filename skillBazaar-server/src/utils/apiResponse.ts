import { Response } from "express";
import type { ApiResponse } from "../types";

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  meta?: ApiResponse["meta"],
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta,
  };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: string
): void {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  };
  res.status(statusCode).json(response);
}

import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  status?: number;
  code?: string;
  cause?: any;
}

/**
 * Error handling middleware
 */
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = error.status || 500;
  const message = error.message || "Internal Server Error";
  const code = error.code || "INTERNAL_ERROR";

  const redactKeys = new Set([
    "password",
    "token",
    "resetToken",
    "currentPassword",
    "newPassword",
    "confirmPassword",
  ]);

  const sanitizedBody =
    req.body && typeof req.body === "object"
      ? Object.fromEntries(
          Object.entries(req.body).map(([key, value]) => [
            key,
            redactKeys.has(key) ? "[REDACTED]" : value,
          ])
        )
      : req.body;

  console.error(`[${new Date().toISOString()}] Error:`, {
    status,
    code,
    message,
    path: req.path,
    method: req.method,
    body: sanitizedBody,
    ...(error.cause && { cause: error.cause instanceof Error ? { message: error.cause.message, stack: error.cause.stack } : error.cause }),
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    },
  });
};
/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
  errorHandler,
  asyncHandler,
};

import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/httpError";

/**
 * Global error handler — catches all errors passed via next(error).
 * Must be registered LAST in app.ts after all routes.
 * Must have exactly 4 parameters — Express uses this to identify error handlers.
 *
 * Status codes come from toHttpError (404 not found, 403 not authorized,
 * 400 other business errors, 500 for database/unknown errors with a generic message).
 */
export const errorHandler = (
  err: Error,           // the error object passed via next(error)
  req: Request,
  res: Response,
  next: NextFunction,   // required even if unused — removing it breaks Express error handling
) => {
  sendError(res, err);
};

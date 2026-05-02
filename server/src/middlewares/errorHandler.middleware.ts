import ApiResponse from "../utils/ApiResponse";
import { Request, Response, NextFunction } from "express";

/**
 * Global error handler — catches all errors passed via next(error).
 * Must be registered LAST in app.ts after all routes.
 * Must have exactly 4 parameters — Express uses this to identify error handlers.
 *
 * Currently returns 500 for all errors.
 * TODO: implement custom AppError class to support proper status codes
 * (404 not found, 403 forbidden, 400 bad request etc.)
 */
export const errorHandler = (
  err: Error,           // the error object passed via next(error)
  req: Request,
  res: Response,
  next: NextFunction,   // required even if unused — removing it breaks Express error handling
) => {
  // Log full error to server console for debugging
  console.error(err);

  // Return error response — falls back to generic message if err.message is empty
  res.status(500).json(ApiResponse.error(err.message || "Internal Server Error"));
};
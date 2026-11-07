import { Response } from "express";
import ApiResponse from "./ApiResponse";

/**
 * Maps an error thrown by a service to an HTTP status + a safe message.
 * Services throw plain Errors with fixed messages, so the message decides the code:
 *   "... not found" / "... isn't found"  -> 404
 *   "Not authorized"                     -> 403
 *   other plain Errors (business rules)  -> 400, message shown as is
 * Errors that carry a `code` come from pg or Redis. Their text can contain
 * database details, so it is never sent to the client:
 *   22P02 (bad UUID in the URL)          -> 400 "Invalid ID format"
 *   anything else                        -> 500 "Internal Server Error"
 */
export function toHttpError(error: any): { status: number; message: string } {
  const message: string = typeof error?.message === "string" ? error.message : "";

  if (error?.code === "22P02") return { status: 400, message: "Invalid ID format" };
  if (error?.code !== undefined || !message) {
    return { status: 500, message: "Internal Server Error" };
  }

  if (/not authorized/i.test(message)) return { status: 403, message };
  if (/not found|isn't found/i.test(message)) return { status: 404, message };
  return { status: 400, message };
}

/**
 * Sends the mapped error as a JSON response.
 * `publicMessage` replaces the message on 400/404 only (keeps the old fixed texts
 * for public read routes). 403 and 500 always keep their own safe text.
 */
export function sendError(res: Response, error: any, publicMessage?: string) {
  const { status, message } = toHttpError(error);
  if (status === 500) console.error(error);
  const text = publicMessage && (status === 400 || status === 404) ? publicMessage : message;
  res.status(status).json(ApiResponse.error(text));
}

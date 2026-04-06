import ApiResponse from "../utils/ApiResponse";
import { Request, Response, NextFunction } from "express";
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);
  res
    .status(500)
    .json(ApiResponse.error(err.message || "Internal Server Error"));
};

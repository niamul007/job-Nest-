import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import ApiResponse from "../utils/ApiResponse";
import { JwtPayload } from '../types';

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(400).json(ApiResponse.error("No token provided"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json(ApiResponse.error("JWT error"));
  }
};

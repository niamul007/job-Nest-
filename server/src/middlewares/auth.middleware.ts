import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import ApiResponse from "../utils/ApiResponse";
import { JwtPayload } from "../types";

/**
 * Protect middleware — guards all authenticated routes.
 * Verifies the JWT token from the Authorization header.
 * On success: attaches decoded payload to req.user and calls next().
 * On failure: returns 401 immediately — route handler never runs.
 *
 * Expected header format: "Authorization: Bearer <token>"
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    // Reject if no Authorization header or wrong format
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json(ApiResponse.error("No token provided"));
    }

    // Extract token — "Bearer eyJhbGci..." → split → take index [1]
    const token = authHeader.split(" ")[1];

    /**
     * jwt.verify does 3 things simultaneously:
     *   1. Verifies signature — was this signed by our JWT_SECRET?
     *   2. Checks expiry — has the token timed out?
     *   3. Decodes payload — extracts { id, email, role }
     * Throws immediately if any check fails.
     */
    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;

    // Attach decoded payload to request — available to all downstream middleware and controllers
    req.user = decoded;
    next(); // pass to next middleware (authorize or controller)

  } catch (error: any) {
    // Token was valid but has expired — user needs to log in again
    if (error.name === "TokenExpiredError") {
      return res.status(401).json(ApiResponse.error("Token expired"));
    }
    // Token is malformed or tampered with
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json(ApiResponse.error("Invalid token"));
    }
    // Fallback for any other auth error
    res.status(401).json(ApiResponse.error("Not authorized"));
  }
};
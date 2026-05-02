import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Validate middleware — validates req.body against a Zod schema.
 * Uses closure pattern — outer function accepts schema, returns middleware.
 * Must run BEFORE controller — rejects invalid requests early.
 *
 * Uses safeParse (not parse) — never throws, returns result object instead.
 * Returns only the first validation error — clean single message to frontend.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {

    /**
     * safeParse checks req.body against schema rules.
     * Returns: { success: true, data: {...} } or { success: false, error: {...} }
     * Never throws — safe to use without try/catch.
     */
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Return first validation error only — avoids overwhelming the user
      res.status(400).json({
        success: false,
        message: result.error.issues[0].message,
      });
      return;
    }

    next(); // validation passed — continue to controller
  };
};

export default validate;
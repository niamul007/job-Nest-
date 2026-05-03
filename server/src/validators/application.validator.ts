import { z } from "zod";

/**
 * Validation schema for creating a job application.
 * Validated by validate middleware before controller runs.
 * All rules run before any database operations.
 */
export const createApplicationSchema = z.object({
  // Must be a valid UUID — matches PostgreSQL job ID format
  job_id: z.string().uuid("Invalid job ID format"),

  // Meaningful content enforced — min 10 chars
  // Database overflow prevented — max 1000 chars
  cover_letter: z.string()
    .min(10, "Cover letter must be at least 10 characters long")
    .max(1000, "Cover letter must be less than 1000 characters long"),
});
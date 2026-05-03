import { z } from 'zod';

/**
 * Job validation schema — validated before job controller runs.
 * salary_min and salary_max are optional — not all jobs disclose salary.
 * Uses z.coerce.number() for salary fields — handles string-to-number
 * conversion automatically in case values arrive as strings.
 * company_id validated as UUID — must match PostgreSQL format.
 */
export const createJobSchema = z.object({
  // Required — job must have a meaningful title
  title: z.string()
    .min(2, "Job title must be at least 2 characters long")
    .max(500, "Job title must be less than 500 characters long"), // ✅ fixed message

  // Required — meaningful description enforced
  description: z.string()
    .min(10, "Description must be at least 10 characters long")
    .max(5000, "Description must be less than 5000 characters long"), // ✅ fixed message

  // Required — where the job is located
  location: z.string()
    .min(2, "Location must be at least 2 characters long")
    .max(100, "Location must be less than 100 characters long"),

  // Required — must match JobType enum values
  type: z.enum(["full-time", "part-time", "contract", "freelance"], {
    message: "Type must be 'full-time', 'part-time', 'contract', or 'freelance'"
  }),

  // Required — just must exist, no length restriction
  category: z.string().min(1, "Category is required"),

  // Required — must be valid UUID matching PostgreSQL company id
  company_id: z.string().uuid("Invalid company ID format"),

  /**
   * Optional salary range — not all jobs disclose compensation.
   * z.coerce.number() converts strings to numbers automatically.
   * Handles cases where salary arrives as "80" instead of 80.
   */
  salary_min: z.coerce.number()
    .min(0, "Minimum salary must be a positive number")
    .optional(),

  salary_max: z.coerce.number()
    .min(0, "Maximum salary must be a positive number")
    .optional(),
});
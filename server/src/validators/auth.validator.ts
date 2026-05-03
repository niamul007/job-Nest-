import { z } from "zod";

/**
 * Auth validation schemas — validated before controllers run.
 * Register has strict rules — enforces data quality at account creation.
 * Login is intentionally looser — just checks fields exist,
 * bcrypt handles actual password verification.
 */

/**
 * Register schema — strict validation for new account creation.
 * Password regex enforces: min 8 chars, at least one letter, one number.
 * Role enum prevents invalid roles being set at registration.
 */
export const registerSchema = z.object({
  // Name: meaningful length enforced
  name: z.string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must be less than 50 characters long"),

  // Email: must be valid format
  email: z.string().email("Invalid email address"),

  /**
   * Password rules:
   *   min 8 characters
   *   must contain at least one letter ((?=.*[A-Za-z]))
   *   must contain at least one number ((?=.*\d))
   *   only safe characters allowed ([A-Za-z\d@$!%*?&])
   */
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one letter and one number"
    ),

  // Role: only valid enum values accepted
  role: z.enum(["applicant", "employer", "admin"], {
    message: "Role must be 'applicant', 'employer', or 'admin'"
  }),
});

/**
 * Login schema — intentionally simpler than register.
 * Only checks fields exist — bcrypt.compare handles actual verification.
 * No password regex — would lock out users who registered before rules were added.
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"), // just verify it was sent
});
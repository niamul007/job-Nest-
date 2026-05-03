import { z } from "zod";

/**
 * Company validation schemas.
 * Only name is required — description, location, website are optional.
 * Optional fields still enforce format rules if provided.
 * owner_id is not validated here — it comes from JWT in the controller.
 */
export const createCompanySchema = z.object({
  // Required — company must have a name
  name: z.string()
    .min(2, "Company name must be at least 2 characters long")
    .max(200, "Company name must be less than 200 characters long"),

  // Optional — but if provided must be meaningful length
  description: z.string()
    .min(10, "Description must be at least 10 characters long")
    .max(1000, "Description must be less than 1000 characters long")
    .optional(),

  // Optional — but if provided must be valid length
  location: z.string()
    .min(2, "Location must be at least 2 characters long")
    .max(100, "Location must be less than 100 characters long")
    .optional(),

  // Optional — but if provided must be a valid URL format
  // "acme.com" fails — must include protocol: "https://acme.com"
  website: z.string()
    .url("Invalid URL format")
    .optional(),
});
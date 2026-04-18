import { z } from "zod";

export const createApplicationSchema = z.object({
    job_id: z.string().uuid("Invalid job ID format"),
    cover_letter: z.string().min(10, "Cover letter must be at least 10 characters long").max(1000, "Cover letter must be less than 1000 characters long"),
});
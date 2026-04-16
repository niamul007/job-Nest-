import {z} from 'zod';

export const createJobSchema = z.object({
    title: z.string().min(2, "Job title must be at least 2 characters long").max(500, "Job title must be less than 100 characters long"),
    description: z.string().min(10, "Description must be at least 10 characters long").max(1000, "Description must be less than 1000 characters long"),
    location: z.string().min(2, "Location must be at least 2 characters long").max(100, "Location must be less than 100 characters long"),
    type: z.enum(["full-time", "part-time", "contract", "freelance"], {message: "Type must be 'full-time', 'part-time', 'contract', or 'freelance'"}),
    company_id: z.string().uuid("Invalid company ID format"),
    salary_min: z.number().min(0, "Minimum salary must be a positive number").optional(),
    salary_max: z.number().min(0, "Maximum salary must be a positive number").optional(),
})
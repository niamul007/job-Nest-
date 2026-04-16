import {z} from "zod";

export const createCompanySchema = z.object({
    name: z.string().min(2, "Company name must be at least 2 characters long").max(200, "Company name must be less than 200 characters long"),
    description: z.string().min(10, "Description must be at least 10 characters long").max(1000, "Description must be less than 1000 characters long"),
    location: z.string().min(2, "Location must be at least 2 characters long").max(100, "Location must be less than 100 characters long"),
    website: z.string().url("Invalid URL format").optional(),
})
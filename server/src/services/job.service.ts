import * as jobModel from "../models/job.model";
import * as companyModel from "../models/company.model";
import { redisClient } from '../config/redis';

export async function createJob(
  company_id: string,
  title: string,
  description: string,
  location: string,
  type: string,
  category: string,
  salary_min: number,
  salary_max: number,
  userId: string,
) {
  const existing = await companyModel.findCompanyById(company_id);
  if (!existing) throw new Error("Company not found");
  if (existing.owner_id !== userId) throw new Error("Not authorized");
  const newJob = await jobModel.createJob(
    company_id,
    title,
    description,
    location,
    type,
    category,
    salary_min,
    salary_max,
  );
  await redisClient.del('jobs:{}');
  return newJob;
}

export async function getAllJobs(filters?: {
  category?: string;
  type?: string;
  salary_min?: number;
}) {
  // Create a unique cache key based on filters
  const cacheKey = `jobs:${JSON.stringify(filters || {})}`;

  // Check Redis first
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log('✅ Returning from cache'); 
    return JSON.parse(cached);
  }

  // Not in cache — hit database
  const jobs = await jobModel.findAllJobs(filters);

  // Store in Redis for 5 minutes (300 seconds)
  await redisClient.setEx(cacheKey, 300, JSON.stringify(jobs));

  return jobs;
}

export async function getJobById(id: string) {
  if (!id) throw new Error("Id isn't found");
  const existing = await jobModel.findJobById(id);
  if (!existing) throw new Error("Job isn't found");
  return existing;
}

export async function updateJob(id: string, userId: string, data: any) {
  const existing = await jobModel.findJobById(id);
  if (!existing) throw new Error("Job isn't found");
  const company = await companyModel.findCompanyById(existing.company_id);
  if (!company) throw new Error("Company not found");
  if (company.owner_id !== userId) throw new Error("Not authorized");
  return await jobModel.updateJob(id, data);
}

export async function deleteJob(id: string, userId: string) {
  const existing = await jobModel.findJobById(id);
  if (!existing) throw new Error("Job isn't found");
  const company = await companyModel.findCompanyById(existing.company_id);
  if (!company) throw new Error("Company not found");
  if (company.owner_id !== userId) throw new Error("Not authorized");
  await jobModel.deleteJob(id);
}

export async function submitJobForReview(id: string, userId: string) {
  const existing = await jobModel.findJobById(id);
  if (!existing) throw new Error("Job isn't found");
  const company = await companyModel.findCompanyById(existing.company_id);
  if (!company) throw new Error("Company not found");
  if (company.owner_id !== userId) throw new Error("Not authorized");
  return await jobModel.updateJobStatus(id, "pending");
}

export async function approveJob(id: string) {
  const existing = await jobModel.findJobById(id);
  if (!existing) throw new Error("Job isn't found");
  await redisClient.del('jobs:{}');
  return await jobModel.updateJobStatus(id, "active");
}

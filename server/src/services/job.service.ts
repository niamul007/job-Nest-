import * as jobModel from "../models/job.model";
import * as companyModel from "../models/company.model";
import { redisClient } from '../config/redis';
import { JobType, JobStatus } from '../types';

// ✅ Proper interface instead of any
interface UpdateJobData {
  title?: string;
  description?: string;
  location?: string;
  type?: JobType;
  category?: string;
  salary_min?: number;
  salary_max?: number;
}

// ✅ Helper to clear all job caches
async function clearJobCache(id?: string) {
  const keys = await redisClient.keys('jobs:*');
  if (keys.length > 0) await redisClient.del(keys);
  if (id) await redisClient.del(`jobs:${id}`);
}

export async function createJob(
  company_id: string,
  title: string,
  description: string,
  location: string,
  type: JobType,        // ✅ enum
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

  await clearJobCache(); // ✅ clear all job caches
  return newJob;
}

export async function getAllJobs(filters?: {
  category?: string;
  type?: string;
  salary_min?: number;
}) {
  const cacheKey = `jobs:${JSON.stringify(filters || {})}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log('✅ Returning from cache');
    return JSON.parse(cached);
  }

  const jobs = await jobModel.findAllJobs(filters);
  await redisClient.setEx(cacheKey, 300, JSON.stringify(jobs));
  return jobs;
}

export async function getJobById(id: string) {
  if (!id) throw new Error("Id isn't found");

  // ✅ cache single job
  const cacheKey = `jobs:${id}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log('✅ Returning from cache');
    return JSON.parse(cached);
  }

  const existing = await jobModel.findJobById(id);
  if (!existing) throw new Error("Job isn't found");

  await redisClient.setEx(cacheKey, 600, JSON.stringify(existing));
  return existing;
}

export async function updateJob(id: string, userId: string, data: UpdateJobData) { // ✅ proper type
  const existing = await jobModel.findJobById(id);
  if (!existing) throw new Error("Job isn't found");

  const company = await companyModel.findCompanyById(existing.company_id);
  if (!company) throw new Error("Company not found");
  if (company.owner_id !== userId) throw new Error("Not authorized");

  const updated = await jobModel.updateJob(id, data);
  await clearJobCache(id); // ✅ clear cache after update
  return updated;
}

export async function deleteJob(id: string, userId: string) {
  const existing = await jobModel.findJobById(id);
  if (!existing) throw new Error("Job isn't found");

  const company = await companyModel.findCompanyById(existing.company_id);
  if (!company) throw new Error("Company not found");
  if (company.owner_id !== userId) throw new Error("Not authorized");

  await jobModel.deleteJob(id);
  await clearJobCache(id); // ✅ clear cache after delete
}

export async function submitJobForReview(id: string, userId: string) {
  const existing = await jobModel.findJobById(id);
  if (!existing) throw new Error("Job isn't found");

  const company = await companyModel.findCompanyById(existing.company_id);
  if (!company) throw new Error("Company not found");
  if (company.owner_id !== userId) throw new Error("Not authorized");

  const updated = await jobModel.updateJobStatus(id, JobStatus.Pending); // ✅ enum
  await clearJobCache(id); // ✅ clear cache
  return updated;
}

export async function approveJob(id: string) {
  const existing = await jobModel.findJobById(id);
  if (!existing) throw new Error("Job isn't found");

  const updated = await jobModel.updateJobStatus(id, JobStatus.Active); // ✅ enum
  await clearJobCache(id); // ✅ clear cache
  return updated;
}


export async function getJobsByCompany(company_id: string) {
  return await jobModel.findJobsByCompany(company_id);
}

export async function getPendingJobs() {
  return await jobModel.findPendingJobs();
}
import * as jobModel from "../models/job.model";
import * as companyModel from "../models/company.model";
import { redisClient } from '../config/redis';
import { JobType, JobStatus } from '../types';

/**
 * Job service — business logic layer between controllers and the database.
 * Handles: ownership verification, caching, and status lifecycle management.
 * All functions here make decisions — the model layer only runs queries.
 */

/**
 * Typed interface for partial job updates.
 * All fields are optional — only provided fields will be updated (via COALESCE in model).
 * Using a proper interface instead of 'any' keeps TypeScript safety intact.
 */
interface UpdateJobData {
  title?: string;
  description?: string;
  location?: string;
  type?: JobType;
  category?: string;
  salary_min?: number;
  salary_max?: number;
}

/**
 * Clears job-related Redis cache entries.
 * Called after any operation that changes job data to prevent stale cache.
 * - Always clears all jobs:* keys (list caches with any filter combination)
 * - Optionally clears a specific job's cache by ID
 */
async function clearJobCache(id?: string) {
  const keys = await redisClient.keys('jobs:*');
  if (keys.length > 0) await redisClient.del(keys);
  if (id) await redisClient.del(`jobs:${id}`);
}

/**
 * Creates a new job listing under a company.
 * Validates: company exists + requesting user owns the company.
 * New jobs start with status 'draft' (set by DB default).
 * Clears all job caches after creation.
 */
export async function createJob(
  company_id: string,
  title: string,
  description: string,
  location: string,
  type: JobType,
  category: string,
  salary_min: number,
  salary_max: number,
  userId: string,
) {
  // Ownership check — employer can only post jobs under their own company
  const existing = await companyModel.findCompanyById(company_id);
  if (!existing) throw new Error("Company not found");
  if (existing.owner_id !== userId) throw new Error("Not authorized");

  const newJob = await jobModel.createJob(
    company_id, title, description, location, type, category, salary_min, salary_max,
  );

  await clearJobCache();
  return newJob;
}

/**
 * Returns all active jobs with optional filters.
 * Cache strategy:
 *   - Cache key includes filters so each unique filter combo is cached separately
 *   - Cache hit → returns from Redis instantly (no DB query)
 *   - Cache miss → queries DB and caches result for 300 seconds (5 minutes)
 */
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
  await redisClient.setEx(cacheKey, 300, JSON.stringify(jobs)); // cache for 5 minutes
  return jobs;
}

/**
 * Returns a single job by ID.
 * Cache strategy:
 *   - Individual jobs cached for 600 seconds (10 minutes)
 *   - Longer than list cache — single jobs change less frequently
 */
export async function getJobById(id: string) {
  if (!id) throw new Error("Id isn't found");

  const cacheKey = `jobs:${id}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log('✅ Returning from cache');
    return JSON.parse(cached);
  }

  const existing = await jobModel.findJobById(id);
  if (!existing) throw new Error("Job isn't found");

  await redisClient.setEx(cacheKey, 600, JSON.stringify(existing)); // cache for 10 minutes
  return existing;
}

/**
 * Partially updates a job's content (title, description, salary etc).
 * Ownership check: user must own the company that posted the job.
 * Clears both list caches and this job's individual cache after update.
 */
export async function updateJob(id: string, userId: string, data: UpdateJobData) {
  const existing = await jobModel.findJobById(id);
  if (!existing) throw new Error("Job isn't found");

  // Ownership: job → company → company.owner_id must match userId
  const company = await companyModel.findCompanyById(existing.company_id);
  if (!company) throw new Error("Company not found");
  if (company.owner_id !== userId) throw new Error("Not authorized");

  const updated = await jobModel.updateJob(id, data);
  await clearJobCache(id);
  return updated;
}

/**
 * Permanently deletes a job.
 * Ownership check: only the employer who owns the company can delete.
 * Clears cache after deletion.
 */
export async function deleteJob(id: string, userId: string) {
  const existing = await jobModel.findJobById(id);
  if (!existing) throw new Error("Job isn't found");

  const company = await companyModel.findCompanyById(existing.company_id);
  if (!company) throw new Error("Company not found");
  if (company.owner_id !== userId) throw new Error("Not authorized");

  await jobModel.deleteJob(id);
  await clearJobCache(id);
}

/**
 * Employer submits a draft job for admin review.
 * Lifecycle: draft → pending
 * Ownership check: only the employer who owns the company can submit.
 * Clears cache after status change.
 */
export async function submitJobForReview(id: string, userId: string) {
  const existing = await jobModel.findJobById(id);
  if (!existing) throw new Error("Job isn't found");

  const company = await companyModel.findCompanyById(existing.company_id);
  if (!company) throw new Error("Company not found");
  if (company.owner_id !== userId) throw new Error("Not authorized");

  const updated = await jobModel.updateJobStatus(id, JobStatus.Pending);
  await clearJobCache(id);
  return updated;
}

/**
 * Admin approves a pending job — makes it visible to the public.
 * Lifecycle: pending → active
 * No ownership check — admins can approve any company's job.
 * Clears cache after status change.
 */
export async function approveJob(id: string) {
  const existing = await jobModel.findJobById(id);
  if (!existing) throw new Error("Job isn't found");

  const updated = await jobModel.updateJobStatus(id, JobStatus.Active);
  await clearJobCache(id);
  return updated;
}

/**
 * Returns all jobs belonging to a specific company.
 * No caching — employer-specific data changes frequently.
 */
export async function getJobsByCompany(company_id: string) {
  return await jobModel.findJobsByCompany(company_id);
}

/**
 * Returns all jobs with status 'pending' — for admin review queue.
 * No caching — admin needs real-time accurate data.
 */
export async function getPendingJobs() {
  return await jobModel.findPendingJobs();
}
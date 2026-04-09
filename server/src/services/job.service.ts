import * as jobModel from "../models/job.model";
import * as companyModel from "../models/company.model";

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
  return newJob;
}

export async function getAllJobs(filters?: {
  category?: string;
  type?: string;
  salary_min?: number;
}) {
  return await jobModel.findAllJobs(filters);
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
  return await jobModel.updateJobStatus(id, "active");
}

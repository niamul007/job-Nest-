import * as companyModel from "../models/company.model";
import * as applicationModel from "../models/application.model";
import * as jobModel from "../models/job.model";

export async function applyToJob(
  job_id: string,
  applicant_id: string,
  cover_letter: string,
) {
  const job = await jobModel.findJobById(job_id);
  if (!job) throw new Error("job isn't found");
  const company = await companyModel.findCompanyById(job.company_id);
  if (!company) throw new Error("Company not found");
  if (company.owner_id !== userId) throw new Error("Not authorized");
  const existingApplication = await applicationModel.findExistingApplication(
    job_id,
    applicant_id,
  );
  if (existingApplication.length > 0)
    throw new Error("you have already applied to this job");
  const application = await applicationModel.createApplication(
    job_id,
    applicant_id,
    cover_letter,
  );
  return application;
}

export async function getApplicationByJob(job_id: string, userId: string) {
  const job = await jobModel.findJobById(job_id);
  if (!job) throw new Error("Job not found");
  if (job_id !== userId) throw new Error("Employer doesn't own the company");
  const application = applicationModel.findApplicationsByJob(job_id);
  return application;
}

export async function getApplicationsByApplicant(applicant_id: string) {
  const application =
    await applicationModel.findApplicationsByApplicant(applicant_id);
  return application;
}

export async function updateApplicationStatus(
  id: string,
  status: string,
  userId: string,
) {
  const application = await applicationModel.findApplicationById(id);
  if (!application) throw new Error("Application not found");
  const job = await jobModel.findJobById(application.job_id);
  if (!job) throw new Error("Job not found");
  const company = await companyModel.findCompanyById(job.company_id);
  if (!company) throw new Error("Company not found");
  if (company.owner_id !== userId) throw new Error("Not authorized");
  const update = await applicationModel.updateApplicationStatus(id,status);
  return update;
}


import * as companyModel from "../models/company.model";
import * as applicationModel from "../models/application.model";
import * as jobModel from "../models/job.model";
import * as userModel from "../models/user.model";
import { notifyUser } from "../websocket/ws.server";
import emailQueue from "../queues/email.queue";

export async function applyToJob(
  job_id: string,
  applicant_id: string,
  cover_letter: string,
  applicant_email: string,
) {
  const job = await jobModel.findJobById(job_id);
  if (!job) throw new Error("job isn't found");
  if (job.status !== "active") throw new Error("Job is not active");
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
  emailQueue.add({
    type: 'application_received',
    email: applicant_email,
    jobTitle: job.title,
  });
  return application;
}

export async function getApplicationByJob(job_id: string, userId: string) {
  const job = await jobModel.findJobById(job_id);
  if (!job) throw new Error("Job not found");
  const company = await companyModel.findCompanyById(job.company_id);
  if (!company) throw new Error("Company not found");
  if (company.owner_id !== userId) throw new Error("Not authorized");
  const application = await applicationModel.findApplicationsByJob(job_id);
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
  const update = await applicationModel.updateApplicationStatus(id, status);

  const applicant = await userModel.findUserById(application.applicant_id);
  if (applicant) {
    emailQueue.add({
      type: 'status_update',
      email: applicant.email,
      jobTitle: job.title,
      status,
    });
  }

  notifyUser(application.applicant_id, {
    type: "application_status_update",
    message: `Your application status has been updated to: ${status}`,
    status,
  });
  return update;
}


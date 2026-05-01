import * as companyModel from "../models/company.model";
import * as applicationModel from "../models/application.model";
import * as jobModel from "../models/job.model";
import * as userModel from "../models/user.model";
import { notifyUser } from "../websocket/ws.server";
import emailQueue from "../queues/email.queue";

/**
 * Application service — business logic for job applications.
 * Most complex service in the app — connects 4 models, email queue, and WebSockets.
 */

/**
 * Submits a new job application.
 * Three checks before creating:
 *   1. Job exists
 *   2. Job is active (not draft/pending/closed)
 *   3. Applicant hasn't already applied to this job
 * Queues a confirmation email after successful application.
 * Email is fire-and-forget (no await) — user gets instant response.
 */
export async function applyToJob(
  job_id: string,
  applicant_id: string,
  cover_letter: string,
  applicant_email: string,
) {
  // Validate job exists and is accepting applications
  const job = await jobModel.findJobById(job_id);
  if (!job) throw new Error("job isn't found");
  if (job.status !== "active") throw new Error("Job is not active");

  // Prevent duplicate applications
  const existingApplication = await applicationModel.findExistingApplication(job_id, applicant_id);
  if (existingApplication.length > 0) throw new Error("you have already applied to this job");

  // Create the application
  const application = await applicationModel.createApplication(job_id, applicant_id, cover_letter);

  // Queue confirmation email — no await, runs in background so user isn't kept waiting
  emailQueue.add({
    type: 'application_received',
    email: applicant_email,
    jobTitle: job.title,
  });

  return application;
}

/**
 * Returns all applications for a specific job.
 * Ownership check: traces application → job → company → owner
 * Only the employer who owns the company can see its job applications.
 */
export async function getApplicationByJob(job_id: string, userId: string) {
  const job = await jobModel.findJobById(job_id);
  if (!job) throw new Error("Job not found");

  // Ownership: only the company owner can view applications for their job
  const company = await companyModel.findCompanyById(job.company_id);
  if (!company) throw new Error("Company not found");
  if (company.owner_id !== userId) throw new Error("Not authorized");

  return await applicationModel.findApplicationsByJob(job_id);
}

/**
 * Returns all applications submitted by a specific applicant.
 * No ownership check — applicants can only see their own applications
 * (enforced in controller via req.user.id).
 */
export async function getApplicationsByApplicant(applicant_id: string) {
  return await applicationModel.findApplicationsByApplicant(applicant_id);
}

/**
 * Updates the status of an application.
 * Deepest ownership chain in the app:
 *   application → job → company → company.owner_id === userId
 *
 * After update triggers TWO notifications:
 *   1. Email queue  — sends email (works even if applicant is offline)
 *   2. WebSocket    — sends real-time popup (instant if applicant is online)
 *
 * Status lifecycle: pending → reviewed → accepted | rejected
 */
export async function updateApplicationStatus(
  id: string,
  status: string,
  userId: string,
) {
  // Validate application exists
  const application = await applicationModel.findApplicationById(id);
  if (!application) throw new Error("Application not found");

  // Trace back to company to verify ownership
  const job = await jobModel.findJobById(application.job_id);
  if (!job) throw new Error("Job not found");

  const company = await companyModel.findCompanyById(job.company_id);
  if (!company) throw new Error("Company not found");
  if (company.owner_id !== userId) throw new Error("Not authorized");

  // Update the status
  const update = await applicationModel.updateApplicationStatus(id, status);

  // Notify the applicant via email (fire and forget — no await)
  const applicant = await userModel.findUserById(application.applicant_id);
  if (applicant) {
    emailQueue.add({
      type: 'status_update',
      email: applicant.email,
      jobTitle: job.title,
      status,
    });
  }

  // Notify the applicant via WebSocket (real-time, instant)
  notifyUser(application.applicant_id, {
    type: "application_status_update",
    message: `Your application status has been updated to: ${status}`,
    status,
  });

  return update;
}
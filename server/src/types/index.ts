/**
 * Central type definitions for the JobNest API.
 * All interfaces map directly to database tables.
 * Enums replace raw strings to prevent typos and enable TypeScript safety.
 */

// ── Enums ─────────────────────────────────────────────────────────────────────

/** Roles that determine what a user can access in the system */
export enum UserRole {
  Admin = "admin",       // can approve jobs and manage users
  Employer = "employer", // can create companies and post jobs
  Applicant = "applicant", // can apply to jobs
}

/** Employment type options for a job listing */
export enum JobType {
  FullTime = "full-time",
  PartTime = "part-time",
  Contract = "contract",
  Freelance = "freelance",
}

/**
 * Lifecycle stages of a job listing:
 * draft → pending → active → closed
 */
export enum JobStatus {
  Draft = "draft",       // created but not submitted
  Pending = "pending",   // submitted, waiting for admin approval
  Active = "active",     // approved and visible to applicants
  Closed = "closed",     // no longer accepting applications
}

/** Lifecycle stages of a job application */
export enum ApplicationStatus {
  Pending = "pending",   // just submitted
  Reviewed = "reviewed", // employer has seen it
  Accepted = "accepted", // applicant got the job
  Rejected = "rejected", // applicant was declined
}

// ── Interfaces ────────────────────────────────────────────────────────────────
// Each interface mirrors a database table schema

/** Maps to the users table */
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // stored as bcrypt hash, never returned in API responses
  role: UserRole;
  created_at: Date;
}

/** Maps to the companies table — owner_id links to the employer who created it */
export interface Company {
  id: string;
  name: string;
  description: string;
  website?: string;  // optional
  logo_url?: string; // optional
  owner_id: string;  // FK → users.id (the employer who owns this company)
  created_at: Date;
}

/** Maps to the jobs table — company_id links to the company posting the job */
export interface Job {
  id: string;
  company_id: string; // FK → companies.id
  title: string;
  description: string;
  location: string;
  type: JobType;
  category: string;
  salary_min?: number; // optional — not all jobs disclose salary
  salary_max?: number; // optional
  status: JobStatus;
  created_at: Date;
}

/** Maps to the applications table */
export interface Application {
  id: string;
  job_id: string;       // FK → jobs.id
  applicant_id: string; // FK → users.id (the applicant)
  cover_letter?: string; // optional
  status: ApplicationStatus;
  created_at: Date;
}

/** Maps to the notifications table */
export interface Notification {
  id: string;
  user_id: string; // FK → users.id (who receives the notification)
  message: string;
  is_read: boolean;
  created_at: Date;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Shape of the data encoded inside a JWT token.
 * Extracted by the protect middleware and attached to req.user.
 * Only contains what's needed for auth — no sensitive data like password.
 */
export interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}

/** Standard API response wrapper used across all endpoints */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T; // generic — can hold any type depending on the endpoint
}

// ── Express Augmentation ──────────────────────────────────────────────────────

/**
 * Extends Express's Request type to include the authenticated user.
 * Set by the protect middleware after JWT verification.
 * Without this declaration, TypeScript would throw an error on every req.user access.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
export enum UserRole {
  Admin = "admin",
  Employer = "employer",
  Applicant = "applicant",
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  website?: string;
  logo_url?: string;
  owner_id: string; //(this links to the user who created it)
  created_at: Date;
}

export enum JobType {
  FullTime = "full-time",
  PartTime = "part-time",
  Contract = "contract",
  Freelance = "freelance",
}

export enum JobStatus {
  Draft = "draft",
  Pending = "pending",
  Active = "active",
  Closed = "closed",
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  location: string;
  type: JobType;
  category: string;
  salary_min?: number;
  salary_max?: number;
  status: JobStatus;
  created_at: Date;
}

export enum ApplicationStatus {
  Pending = "pending",
  Reviewed = "reviewed",
  Accepted = "accepted",
  Rejected = "rejected",
}
export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_letter?: string;
  status: ApplicationStatus;
  created_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}

export interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// User
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export enum UserRole {
  Admin = "admin",
  Employer = "employer",
  Applicant = "applicant",
}

// Auth
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Company
export interface Company {
  id: string;
  name: string;
  description: string;
  website?: string;
  logo_url?: string;
  owner_id: string;
  created_at: string;
}

export interface CreateCompanyData {
  name: string;
  description: string;
  website?: string;
  logo_url?: string;
}

export interface UpdateCompanyData {
  name?: string;
  description?: string;
  website?: string;
  logo_url?: string;
}

// Job
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
  created_at: string;
  company?: Company;
}

export interface CreateJobData {
  company_id: string;
  title: string;
  description: string;
  location: string;
  type: JobType;
  category: string;
  salary_min?: number;
  salary_max?: number;
}

export interface UpdateJobData {
  title?: string;
  description?: string;
  location?: string;
  type?: JobType;
  category?: string;
  salary_min?: number;
  salary_max?: number;
}

// Application
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
  created_at: string;
  job?: Job;
}

export interface CreateApplicationData {
  job_id: string;
  cover_letter?: string;
}

export interface UpdateApplicationData {
  status: ApplicationStatus;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
import api from './axios';
import type { Job, ApiResponse, CreateJobData, UpdateJobData } from '../types';

/**
 * Job service — all API calls for job operations.
 * Mirrors backend job routes exactly.
 * Token attached automatically by Axios interceptor.
 */

/**
 * GET /api/jobs — public, no token needed
 * Filters passed as query params → ?category=Engineering&type=full-time
 * Axios { params } converts object to query string automatically
 */
export const getAllJobs = async (filters?: {
  category?: string;
  type?: string;
  salary_min?: number;
}): Promise<ApiResponse<Job[]>> => {
  const response = await api.get('/jobs', { params: filters });
  return response.data;
};

/** GET /api/jobs/:id — public, returns single job */
export const getJobById = async (id: string): Promise<ApiResponse<Job>> => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

/**
 * POST /api/jobs — employer only
 * TODO: change Partial<Job> to CreateJobData for proper typing
 * Partial<Job> allows sending id/status/created_at which should never be sent
 */
export const createJob = async (data: CreateJobData): Promise<ApiResponse<Job>> => {
  const response = await api.post('/jobs', data);
  return response.data;
};

/**
 * PUT /api/jobs/:id — employer only
 * Partial update — only changed fields needed (COALESCE on backend)
 * TODO: change Partial<Job> to UpdateJobData for proper typing
 */
export const updateJob = async (id: string, data: UpdateJobData): Promise<ApiResponse<Job>> => {
  const response = await api.put(`/jobs/${id}`, data);
  return response.data;
};

/** DELETE /api/jobs/:id — employer only */
export const deleteJob = async (id: string): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/jobs/${id}`);
  return response.data;
};

/**
 * PATCH /api/jobs/:id/submit — employer only
 * Lifecycle: draft → pending
 * No body needed — just the job ID
 */
export const submitJob = async (id: string): Promise<ApiResponse<Job>> => {
  const response = await api.patch(`/jobs/${id}/submit`);
  return response.data;
};

/**
 * PATCH /api/jobs/:id/approve — admin only
 * Lifecycle: pending → active
 * No body needed — just the job ID
 */
export const approveJob = async (id: string): Promise<ApiResponse<Job>> => {
  const response = await api.patch(`/jobs/${id}/approve`);
  return response.data;
};

/** GET /api/jobs/company/:id — employer only */
export const getJobsByCompany = async (companyId: string): Promise<ApiResponse<Job[]>> => {
  const response = await api.get(`/jobs/company/${companyId}`);
  return response.data;
};

/** GET /api/jobs/pending — admin only */
export const getPendingJobs = async (): Promise<ApiResponse<Job[]>> => {
  const response = await api.get('/jobs/pending');
  return response.data;
};
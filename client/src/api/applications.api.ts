import api from './axios';
import type {
  Application,
  ApiResponse,
  CreateApplicationData,
  UpdateApplicationData
} from '../types';

/**
 * Application service — all API calls for job applications.
 * Mirrors backend application routes exactly.
 * Token attached automatically by Axios interceptor.
 */

/**
 * POST /api/applications — applicant only
 * Sends job_id and cover_letter
 * applicant_id and email NOT sent — backend reads from JWT
 * Triggers confirmation email via Bull queue on backend
 */
export const applyForJob = async (data: CreateApplicationData): Promise<ApiResponse<Application>> => {
  const response = await api.post('/applications', data);
  return response.data;
};

/**
 * GET /api/applications/my — applicant only
 * No ID parameter — backend reads applicant_id from JWT
 * Returns only THIS user's applications — can't see others
 */
export const getMyApplications = async (): Promise<ApiResponse<Application[]>> => {
  const response = await api.get('/applications/my');
  return response.data;
};

/**
 * GET /api/applications/job/:id — employer only
 * Returns all applications for a specific job
 * Backend verifies employer owns the company that posted the job
 */
export const getApplicationsByJob = async (jobId: string): Promise<ApiResponse<Application[]>> => {
  const response = await api.get(`/applications/job/${jobId}`);
  return response.data;
};

/**
 * PATCH /api/applications/:id/status — employer only
 * Updates application status: pending → reviewed → accepted | rejected
 * Triggers email + WebSocket notification to applicant on backend
 */
export const updateApplicationStatus = async (
  id: string,
  data: UpdateApplicationData
): Promise<ApiResponse<Application>> => {
  const response = await api.patch(`/applications/${id}/status`, data);
  return response.data;
};
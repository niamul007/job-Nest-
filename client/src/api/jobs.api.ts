import api from './axios';
import type { Job, ApiResponse } from '../types';

export const getAllJobs = async (filters?: {
  category?: string;
  type?: string;
  salary_min?: number;
}): Promise<ApiResponse<Job[]>> => {
  const response = await api.get('/jobs', { params: filters });
  return response.data;
};

export const getJobById = async (id: string): Promise<ApiResponse<Job>> => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const createJob = async (data: Partial<Job>): Promise<ApiResponse<Job>> => {
  const response = await api.post('/jobs', data);
  return response.data;
};

export const updateJob = async (id: string, data: Partial<Job>): Promise<ApiResponse<Job>> => {
  const response = await api.put(`/jobs/${id}`, data);
  return response.data;
};

export const deleteJob = async (id: string): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/jobs/${id}`);
  return response.data;
};

export const submitJob = async (id: string): Promise<ApiResponse<Job>> => {
  const response = await api.patch(`/jobs/${id}/submit`);
  return response.data;
};

export const approveJob = async (id: string): Promise<ApiResponse<Job>> => {
  const response = await api.patch(`/jobs/${id}/approve`);
  return response.data;
};

export const getJobsByCompany = async (companyId: string): Promise<ApiResponse<Job[]>> => {
  const response = await api.get(`/jobs/company/${companyId}`);
  return response.data;
};
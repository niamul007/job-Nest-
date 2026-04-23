import api from './axios';
import type { Application, ApiResponse, CreateApplicationData, UpdateApplicationData } from '../types';

export const applyForJob = async (data: CreateApplicationData): Promise<ApiResponse<Application>> => {
  const response = await api.post('/applications', data);
  return response.data;
};

export const getMyApplications = async (): Promise<ApiResponse<Application[]>> => {
  const response = await api.get('/applications/my');
  return response.data;
};

export const getApplicationsByJob = async (jobId: string): Promise<ApiResponse<Application[]>> => {
  const response = await api.get(`/applications/job/${jobId}`);
  return response.data;
};

export const updateApplicationStatus = async (id: string, data: UpdateApplicationData): Promise<ApiResponse<Application>> => {
  const response = await api.patch(`/applications/${id}/status`, data);
  return response.data;
};
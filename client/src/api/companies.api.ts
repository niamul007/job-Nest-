import api from './axios';
import type {
  Company,
  ApiResponse,
  CreateCompanyData,
  UpdateCompanyData
} from '../types';

/**
 * Company service — all API calls for company operations.
 * Mirrors backend company routes exactly.
 * Token attached automatically by Axios interceptor.
 * No auth logic here — that's handled by interceptor and Zustand.
 */

/** GET /api/companies — public, no token needed */
export const getAllCompanies = async (): Promise<ApiResponse<Company[]>> => {
  const response = await api.get('/companies');
  return response.data;
};

/** GET /api/companies/:id — public, returns single company */
export const getCompanyById = async (id: string): Promise<ApiResponse<Company>> => {
  const response = await api.get(`/companies/${id}`);
  return response.data;
};

/**
 * POST /api/companies — employer only
 * owner_id NOT sent here — backend reads it from JWT
 * Only send what the form collects
 */
export const createCompany = async (data: CreateCompanyData): Promise<ApiResponse<Company>> => {
  const response = await api.post('/companies', data);
  return response.data;
};

/**
 * PUT /api/companies/:id — employer only
 * Partial update — only changed fields needed (COALESCE on backend)
 */
export const updateCompany = async (id: string, data: UpdateCompanyData): Promise<ApiResponse<Company>> => {
  const response = await api.put(`/companies/${id}`, data);
  return response.data;
};

/**
 * DELETE /api/companies/:id — employer only
 * Returns null — no data after deletion
 * Backend cascades → deletes all jobs and applications too
 */
export const deleteCompany = async (id: string): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/companies/${id}`);
  return response.data;
};
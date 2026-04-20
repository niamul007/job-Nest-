import api from './axios';
import type {
  Company,
  ApiResponse,
  CreateCompanyData,
  UpdateCompanyData
} from '../types';

export const getAllCompanies = async (): Promise<ApiResponse<Company[]>> => {
  const response = await api.get('/companies');
  return response.data;
};

export const getCompanyById = async (id: string): Promise<ApiResponse<Company>> => {
  const response = await api.get(`/companies/${id}`);
  return response.data;
};

export const createCompany = async (data: CreateCompanyData): Promise<ApiResponse<Company>> => {
  const response = await api.post('/companies', data);
  return response.data;
};

export const updateCompany = async (id: string, data: UpdateCompanyData): Promise<ApiResponse<Company>> => {
  const response = await api.put(`/companies/${id}`, data);
  return response.data;
};

export const deleteCompany = async (id: string): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/companies/${id}`);
  return response.data;
};
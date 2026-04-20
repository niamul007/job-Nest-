import api from './axios';
import type { LoginData, RegisterData, AuthResponse, ApiResponse } from '../types';

export const register = async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const login = async (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
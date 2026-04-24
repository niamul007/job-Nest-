import api from './axios';
import type { User, ApiResponse } from '../types';

export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
  const response = await api.get('/users');
  return response.data;
};

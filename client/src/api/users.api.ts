import api from './axios';
import type { User, ApiResponse } from '../types';

/**
 * User service — admin only operations.
 * No role check here — backend authorize(Admin) middleware handles that.
 * Returns 403 if non-admin tries to call this.
 */

/**
 * GET /api/users — admin only
 * Returns all users without password fields.
 * Token attached automatically by Axios interceptor.
 */
export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
  const response = await api.get('/users');
  return response.data;
};
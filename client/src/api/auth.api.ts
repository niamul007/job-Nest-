import api from './axios';
import type { LoginData, RegisterData, AuthResponse, ApiResponse } from '../types';

/**
 * Auth service — handles all authentication API calls.
 * Uses configured Axios instance — token attached automatically.
 * Returns typed responses so components know exact data shape.
 */

/**
 * Sends registration data to POST /api/auth/register.
 * Returns token + user on success.
 * Component calls setAuth(user, token) after this succeeds.
 */
export const register = async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post('/auth/register', data);
  return response.data; // response.data = your API's { success, message, data }
};

/**
 * Sends login credentials to POST /api/auth/login.
 * Returns token + user on success.
 * Component calls setAuth(user, token) after this succeeds.
 */
export const login = async (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

/**
 * Clears auth data from localStorage — no API call needed.
 * JWT is stateless — server has no session to invalidate.
 * Token still technically valid until expiry but client can't use it.
 * Component calls useAuthStore().logout() after this to clear Zustand too.
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
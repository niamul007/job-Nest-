import axios from 'axios';

/**
 * Configured Axios instance — used for ALL API calls in the app.
 * Never import axios directly — always import this instead.
 *
 * Features:
 *   1. Base URL set automatically — no need to repeat full URL
 *   2. JWT token attached to every request automatically
 *   3. 401 responses handled globally — redirects to login
 */
const api = axios.create({
  // Use environment variable in production, fallback to localhost in development
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json', // tells backend to expect JSON body
  },
});

/**
 * Request interceptor — runs before EVERY API call.
 * Reads token from localStorage and attaches to Authorization header.
 * This is why components never manually add the token — it's automatic.
 *
 * Mirrors backend protect middleware — both handle JWT the same way.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config; // must return config — like calling next() in Express
});

/**
 * Response interceptor — runs after EVERY API response.
 * Success → passes through unchanged.
 * 401 error → token expired or invalid:
 *   → clears localStorage 
 *   → redirects to login page
 *   → rejects promise so component catch blocks still fire
 *
 * Handles token expiry globally — no need to check 401 in every component.
 */
api.interceptors.response.use(
  (response) => response, // success — pass through unchanged

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');   // clear expired token
      window.location.href = '/login';    // force redirect to login
    }
    return Promise.reject(error); // rethrow — component catch blocks still run
  }
);

export default api;
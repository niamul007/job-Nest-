import { create } from 'zustand'
import type { User } from '../types'

/**
 * Auth state shape — everything related to authentication.
 * Stored globally — any component can read token, user, isAuthenticated.
 */
interface AuthState {
  user: User | null;           // currently logged in user (null if not logged in)
  token: string | null;        // JWT token sent with every API request
  isAuthenticated: boolean;    // quick boolean check for protected routes
  setAuth: (user: User, token: string) => void; // called after login/register
  logout: () => void;          // clears all auth state
}

/**
 * Global auth store — created with Zustand.
 * Persists to localStorage so auth survives page refresh.
 *
 * Usage in any component:
 *   const { token, user, isAuthenticated, setAuth, logout } = useAuthStore()
 */
export const useAuthStore = create<AuthState>((set) => ({

  /**
   * Initial state — reads from localStorage on app startup.
   * Restores previous session if token exists.
   * JSON.parse needed because localStorage stores strings not objects.
   */
  user: localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!)
    : null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'), // !! converts string to boolean

  /**
   * Called after successful login or register.
   * Saves to localStorage (survives refresh) AND updates Zustand (instant UI update).
   * JSON.stringify needed — localStorage only stores strings.
   */
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  /**
   * Clears all auth state.
   * Removes from localStorage (won't survive refresh) AND clears Zustand (instant UI update).
   * isAuthenticated: false triggers redirect to login in protected routes.
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
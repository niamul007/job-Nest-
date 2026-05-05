import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

/**
 * Props for ProtectedRoute component.
 * children    → the page/component to render if checks pass
 * allowedRoles → optional role restriction (omit = any logged in user)
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * ProtectedRoute — frontend equivalent of backend protect + authorize middleware.
 * Wraps pages that require authentication and/or specific roles.
 *
 * Check 1 (protect): is user logged in?
 *   No  → redirect to /login
 *   Yes → continue
 *
 * Check 2 (authorize): if allowedRoles provided, is user's role in the list?
 *   No  → redirect to / (home)
 *   Yes → render the page
 *
 * Uses replace on Navigate so back button doesn't loop back to protected page.
 */
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  // Check 1 — not logged in → redirect to login page
  // Mirrors backend: protect middleware → 401
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check 2 — wrong role → redirect to home
  // Mirrors backend: authorize middleware → 403
  // Only runs if allowedRoles was provided
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // All checks passed → render the protected page
  return <>{children}</>;
};

export default ProtectedRoute;
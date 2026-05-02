import { Response, Request, NextFunction } from 'express'
import ApiResponse from '../utils/ApiResponse';

/**
 * Authorize middleware — role-based access control (RBAC).
 * Must run AFTER protect middleware — relies on req.user being set.
 *
 * Uses a closure pattern: outer function accepts roles, returns middleware.
 * This allows passing parameters to middleware:
 *   authorize('admin')              → only admins
 *   authorize('employer')           → only employers
 *   authorize('admin', 'employer')  → either role allowed
 */
export const authorize = (...roles: string[]) => {
  // outer function captures roles in closure
  // inner function is the actual Express middleware
  return (req: Request, res: Response, next: NextFunction) => {

    /**
     * Two checks:
     * 1. req.user exists — protect middleware ran and verified token
     * 2. user's role is in the allowed roles list
     *
     * 403 Forbidden (not 401) — user IS authenticated but lacks permission
     * 401 = not logged in, 403 = logged in but not allowed
     */
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json(
        ApiResponse.error("Forbidden: You don't have permission to access this resource")
      );
    }

    next(); // role check passed — continue to controller
  }
}
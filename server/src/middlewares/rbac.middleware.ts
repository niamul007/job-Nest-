import {Response , Request , NextFunction} from 'express'
import ApiResponse from '../utils/ApiResponse';
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // check if req.user.role is in roles
    if (!req.user ||!roles.includes(req.user.role)) {
      return res.status(403).json(ApiResponse.error("Forbidden: You don't have permission to access this resource"));
    }
    next();
  }
}   
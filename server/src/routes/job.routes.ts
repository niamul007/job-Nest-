import { Router } from 'express';
import * as jobController from '../controllers/job.controller';
import { authorize } from '../middlewares/rbac.middleware';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createJobSchema } from '../validators/job.validator';
import { UserRole } from '../types';

const router = Router();

router.post("/", protect, authorize('employer'), validate(createJobSchema), jobController.create);
router.get("/", jobController.getAll);

// ✅ specific routes BEFORE /:id
router.get("/company/:company_id", protect, authorize(UserRole.Employer), jobController.getByCompany);

router.get("/:id", jobController.getOne);
router.put("/:id", protect, authorize('employer'), validate(createJobSchema), jobController.update);
router.delete("/:id", protect, authorize('employer'), jobController.remove);
router.patch("/:id/submit", protect, authorize('employer'), jobController.submit);
router.patch("/:id/approve", protect, authorize('admin'), jobController.approve);

export default router;
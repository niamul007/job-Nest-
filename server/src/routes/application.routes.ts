import * as applicationController from "../controllers/application.controller";
import { Router } from "express";
import { authorize } from "../middlewares/rbac.middleware";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", protect, authorize("applicant"), applicationController.apply);
router.get("/job/:id", protect, authorize("employer"), applicationController.getByJob);
router.get("/my", protect, authorize("applicant"), applicationController.getByApplicant);
router.patch("/:id/status", protect, authorize("employer"), applicationController.updateStatus);


export default router;


// Now write src/routes/application.routes.ts. You need:

// POST / — apply to job, applicant only
// GET /job/:id — get applications by job, employer only
// GET /my — get my applications, applicant only
// PATCH /:id/status — update status, employer only
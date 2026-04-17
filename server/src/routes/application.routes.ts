import * as applicationController from "../controllers/application.controller";
import { Router } from "express";
import { authorize } from "../middlewares/rbac.middleware";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createApplicationSchema } from "../validators/application.validator";

const router = Router();

router.post("/", protect, authorize("applicant"), validate(createApplicationSchema), applicationController.apply);
router.get("/job/:id", protect, authorize("employer"), applicationController.getByJob);
router.get("/my", protect, authorize("applicant"), applicationController.getByApplicant);
router.patch("/:id/status", protect, authorize("employer"), applicationController.updateStatus);


export default router;


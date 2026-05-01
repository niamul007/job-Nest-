import * as applicationController from "../controllers/application.controller";
import { Router } from "express";
import { authorize } from "../middlewares/rbac.middleware";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createApplicationSchema } from "../validators/application.validator";

const router = Router();
/**
 * Application routes — all routes require authentication.
 * Role separation:
 *   Applicant → can apply and view own applications
 *   Employer  → can view job applications and update status
 *
 * Route order matters:
 *   /job/:id and /my must come before /:id/status
 *   to prevent Express matching "job" or "my" as an application ID
 */

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Apply for a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateApplicationInput'
 *     responses:
 *       201:
 *         description: Application submitted
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ApplicationResponse'
 *       400:
 *         description: Already applied or job not active
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden — applicant role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */


/**
 * POST /api/applications
 * Applicant submits a job application.
 * Validates body against createApplicationSchema before hitting controller.
 * Service checks: job exists, job is active, not already applied.
 */

router.post("/", protect, authorize("applicant"), validate(createApplicationSchema), applicationController.apply);

/**
 * @swagger
 * /api/applications/job/{id}:
 *   get:
 *     summary: Get all applications for a specific job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Applications for the job
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ApplicationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden — employer role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * GET /api/applications/job/:id
 * Employer views all applications for one of their job listings.
 * :id = job ID (not application ID).
 * Service verifies employer owns the company that posted the job.
 */

router.get("/job/:id", protect, authorize("employer"), applicationController.getByJob);

/**
 * @swagger
 * /api/applications/my:
 *   get:
 *     summary: Get all applications submitted by the logged-in applicant
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The applicant's submitted applications
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ApplicationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden — applicant role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * GET /api/applications/my
 * Applicant views all their own submitted applications.
 * No params needed — applicant_id comes from JWT via req.user.id.
 * NOTE: Must be defined before /:id/status to prevent Express
 * matching "my" as an application ID.
 */
router.get("/my", protect, authorize("applicant"), applicationController.getByApplicant);

/**
 * @swagger
 * /api/applications/{id}/status:
 *   patch:
 *     summary: Update the status of an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateApplicationStatusInput'
 *     responses:
 *       200:
 *         description: Application status updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ApplicationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden — employer role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * PATCH /api/applications/:id/status
 * Employer updates the status of a specific application.
 * :id = application ID.
 * Triggers email + WebSocket notification to the applicant.
 * TODO: Add status validator to ensure value is one of:
 *   pending | reviewed | accepted | rejected
 */
router.patch("/:id/status", protect, authorize("employer"), applicationController.updateStatus);

export default router;

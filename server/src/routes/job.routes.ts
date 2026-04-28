import { Router } from 'express';
import * as jobController from '../controllers/job.controller';
import { authorize } from '../middlewares/rbac.middleware';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createJobSchema } from '../validators/job.validator';
import { UserRole } from '../types';

const router = Router();


/**
 * Job lifecycle:
 * Employer creates (draft) → submits (pending) → Admin approves (active)
 * Only active jobs appear in the public GET /api/jobs listing.
 */

/**
 * POST /api/jobs
 * Creates a new job listing with status set to 'draft'.
 * Middleware chain: protect → authorize(Employer) → validate(schema) → controller
 * @swagger ... (existing swagger comment stays here)
 */

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job listing
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobInput'
 *     responses:
 *       201:
 *         description: Job created (status set to draft)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobResponse'
 *       401:
 *         description: Unauthorized — JWT required
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
router.post("/", protect, authorize(UserRole.Employer), validate(createJobSchema), jobController.create);

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all active jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by job category
 *         example: Engineering
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/JobType'
 *         description: Filter by job type
 *       - in: query
 *         name: salary_min
 *         schema:
 *           type: number
 *         description: Filter jobs with salary_min greater than or equal to this value
 *         example: 80
 *     responses:
 *       200:
 *         description: List of active jobs
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
 *                         $ref: '#/components/schemas/JobResponse'
 */

/**
 * GET /api/jobs
 * Public route — no authentication required.
 * Returns all active jobs. Supports query filters: category, type, salary_min.
 */

router.get("/", jobController.getAll);

/**
 * @swagger
 * /api/jobs/pending:
 *   get:
 *     summary: Get all jobs pending approval
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending jobs
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
 *                         $ref: '#/components/schemas/JobResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden — admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * GET /api/jobs/pending
 * Returns all jobs with status 'pending' — waiting for admin approval.
 * NOTE: Must be defined before /:id to prevent Express matching
 * "pending" as a job ID value.
 */
router.get("/pending", protect, authorize(UserRole.Admin), jobController.getPending);

/**
 * @swagger
 * /api/jobs/company/{company_id}:
 *   get:
 *     summary: Get all jobs belonging to a company
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Jobs for the specified company
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
 *                         $ref: '#/components/schemas/JobResponse'
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
 * GET /api/jobs/company/:company_id
 * Returns all jobs belonging to a specific company.
 * NOTE: Must be defined before /:id — same reason as /pending above.
 */
router.get("/company/:company_id", protect, authorize(UserRole.Employer), jobController.getByCompany);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get a single job by ID
 *     tags: [Jobs]
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
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobResponse'
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * GET /api/jobs/:id
 * Public route — returns a single job by its UUID.
 * NOTE: Defined after all specific routes so Express doesn't
 * mistake route names like "pending" for a job ID.
 */

router.get("/:id", jobController.getOne);

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update a job listing
 *     tags: [Jobs]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobInput'
 *     responses:
 *       200:
 *         description: Job updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobResponse'
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
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 */

/**
 * PUT /api/jobs/:id
 * Replaces a job listing with new data.
 * Only the employer who owns the job should be able to update it
 * (ownership check handled in the controller).
 */

router.put("/:id", protect, authorize(UserRole.Employer), validate(createJobSchema), jobController.update);

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete a job listing
 *     tags: [Jobs]
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
 *         description: Job deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * DELETE /api/jobs/:id
 * Permanently deletes a job listing.
 * Only employers can delete — ownership check in controller.
 */
router.delete("/:id", protect, authorize(UserRole.Employer), jobController.remove);

/**
 * @swagger
 * /api/jobs/{id}/submit:
 *   patch:
 *     summary: Submit a draft job for admin review
 *     tags: [Jobs]
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
 *         description: Job submitted for review (status becomes pending)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobResponse'
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
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * PATCH /api/jobs/:id/submit
 * Employer submits a draft job for admin review.
 * Changes job status from 'draft' → 'pending'.
 */

router.patch("/:id/submit", protect, authorize(UserRole.Employer), jobController.submit);

/**
 * @swagger
 * /api/jobs/{id}/approve:
 *   patch:
 *     summary: Approve a pending job (makes it active)
 *     tags: [Jobs]
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
 *         description: Job approved (status becomes active)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden — admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * PATCH /api/jobs/:id/approve
 * Admin approves a pending job — makes it visible to the public.
 * Changes job status from 'pending' → 'active'.
 */

router.patch("/:id/approve", protect, authorize(UserRole.Admin), jobController.approve);

export default router;

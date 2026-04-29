import { Request, Response, NextFunction } from "express";
import * as jobServices from "../services/job.service";
import * as jobService from "../services/job.service";
import ApiResponse from "../utils/ApiResponse";

/**
 * Job controller — HTTP layer between routes and the job service.
 * Responsibilities: extract request data, call service, send response.
 * No business logic here — all decisions happen in the service layer.
 */

/**
 * POST /api/jobs
 * Creates a new job listing under a company.
 * req.user.id is set by the protect middleware after JWT verification.
 * Passes userId to service for ownership verification.
 */
export const create = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id as string;
    const {
      company_id, title, description, location,
      type, category, salary_min, salary_max,
    } = req?.body;

    if (!userId) throw new Error("user not found");

    const newJob = await jobServices.createJob(
      company_id, title, description, location,
      type, category, salary_min, salary_max, userId,
    );
    res.status(201).json(ApiResponse.success("Job created successfully", newJob));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

/**
 * Extracts and normalises query filter parameters from the request URL.
 * salary_min is converted from string to number — all query params arrive as strings.
 * Only includes filters that were actually provided to avoid overriding DB defaults.
 */
const getFilters = (query: any) => {
  const filters: any = {};
  if (query.category) filters.category = query.category;
  if (query.type) filters.type = query.type;
  if (query.salary_min) filters.salary_min = Number(query.salary_min);
  return filters;
};

/**
 * GET /api/jobs
 * Public route — returns all active jobs with optional filters.
 * Filters extracted from query string: ?category=Engineering&type=full-time&salary_min=80
 */
export const getAll = async (req: Request, res: Response) => {
  try {
    const filters = getFilters(req.query);
    const jobs = await jobServices.getAllJobs(filters);
    res.status(200).json(ApiResponse.success("Response successful", jobs));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error("job not found"));
  }
};

/**
 * GET /api/jobs/:id
 * Public route — returns a single job by its UUID.
 * ID comes from route params: /api/jobs/38bbe3d3-...
 */
export const getOne = async (req: Request, res: Response) => {
  try {
    const id = req?.params?.id as string;
    if (!id) throw new Error("Id isn't found");
    const job = await jobServices.getJobById(id);
    res.status(200).json(ApiResponse.success("Job found by id successfully", job));
  } catch (error) {
    res.status(400).json(ApiResponse.error("job didn't find by id"));
  }
};

/**
 * PUT /api/jobs/:id
 * Updates a job's content fields (title, description, salary etc).
 * userId passed to service for ownership verification — only owner can update.
 * Uses COALESCE in model so only provided fields are changed.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const id = req?.params?.id as string;
    const userId = req?.user?.id as string;
    const { title, description, location, type, category, salary_min, salary_max } = req?.body;
    const updated = await jobServices.updateJob(id, userId, {
      title, description, location, type, category, salary_min, salary_max
    });
    res.status(200).json(ApiResponse.success("Job updated successfully", updated));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

/**
 * DELETE /api/jobs/:id
 * Permanently deletes a job listing.
 * userId passed to service for ownership verification.
 */
export const remove = async (req: Request, res: Response) => {
  try {
    const id = req?.params?.id as string;
    const userId = req?.user?.id as string;
    await jobServices.deleteJob(id, userId);
    res.status(200).json(ApiResponse.success("Job removed", null));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

/**
 * PATCH /api/jobs/:id/submit
 * Employer submits a draft job for admin review.
 * Lifecycle: draft → pending
 * userId verified in service — only owner can submit.
 */
export const submit = async (req: Request, res: Response) => {
  try {
    const id = req?.params?.id as string;
    const userId = req?.user?.id as string;
    const submitted = await jobServices.submitJobForReview(id, userId);
    res.status(200).json(ApiResponse.success("Job submitted successfully", submitted));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

/**
 * PATCH /api/jobs/:id/approve
 * Admin approves a pending job — makes it publicly visible.
 * Lifecycle: pending → active
 * No userId needed — admins can approve any job regardless of ownership.
 */
export const approve = async (req: Request, res: Response) => {
  try {
    const id = req?.params?.id as string;
    const approved = await jobServices.approveJob(id);
    res.status(200).json(ApiResponse.success("Job approved", approved));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

/**
 * GET /api/jobs/company/:company_id
 * Returns all jobs belonging to a specific company.
 * Uses next(error) for consistent error handling via global errorHandler middleware.
 */
export const getByCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { company_id } = req.params as { company_id: string };
    const jobs = await jobService.getJobsByCompany(company_id);
    res.status(200).json(ApiResponse.success("Jobs fetched", jobs));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/jobs/pending
 * Returns all jobs awaiting admin approval.
 * Uses next(error) for consistent error handling via global errorHandler middleware.
 */
export const getPending = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobs = await jobService.getPendingJobs();
    res.status(200).json(ApiResponse.success("Pending jobs fetched", jobs));
  } catch (error) {
    next(error);
  }
};
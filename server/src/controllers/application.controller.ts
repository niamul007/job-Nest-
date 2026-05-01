import * as applicationService from "../services/application.service";
import { Request, Response } from "express";
import ApiResponse from "../utils/ApiResponse";

/**
 * Application controller — HTTP layer between routes and application service.
 * Extracts request data, calls service, sends response.
 * No business logic here — all checks happen in the service layer.
 */

/**
 * POST /api/applications
 * Submits a new job application.
 * job_id and cover_letter come from req.body (what the applicant provides).
 * applicant_id and email come from req.user (JWT) — never trusted from body.
 */
export const apply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { job_id, cover_letter } = req?.body;
    const applicant_id = req?.user?.id as string;  // identity from JWT
    const email = req?.user?.email as string;        // email from JWT — can't be faked

    const result = await applicationService.applyToJob(job_id, applicant_id, cover_letter, email);
    // ✅ should be 201 — a new application resource was created
    res.status(201).json(ApiResponse.success("Job Applied", result));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

/**
 * GET /api/applications/job/:id
 * Returns all applications for a specific job.
 * userId passed to service — only the employer who owns the job can see its applications.
 */
export const getByJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const job_id = req?.params?.id as string;
    const userId = req?.user?.id as string;

    const result = await applicationService.getApplicationByJob(job_id, userId);
    res.status(200).json(ApiResponse.success("Applications fetched by job", result));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

/**
 * GET /api/applications/my
 * Returns all applications submitted by the logged-in applicant.
 * No req.params needed — applicant_id comes from JWT.
 * Applicants can only ever see their own applications this way.
 */
export const getByApplicant = async (req: Request, res: Response): Promise<void> => {
  try {
    const applicant_id = req?.user?.id as string; // who is logged in = whose applications to fetch

    const result = await applicationService.getApplicationsByApplicant(applicant_id);
    res.status(200).json(ApiResponse.success("Applications fetched", result));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

/**
 * PATCH /api/applications/:id/status
 * Employer updates the status of an application.
 * id → which application (from URL)
 * status → new status value (from body)
 * userId → passed to service for ownership verification (from JWT)
 * Triggers both email and WebSocket notification to the applicant.
 */
export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req?.params?.id as string;
    const status = req?.body.status;
    const userId = req?.user?.id as string;

    const result = await applicationService.updateApplicationStatus(id, status, userId);
    res.status(200).json(ApiResponse.success("Status updated successfully", result));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};
import * as applicationService from "../services/application.service";
import { Request, Response } from "express";
import ApiResponse from "../utils/ApiResponse";
export const apply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { job_id, cover_letter } = req?.body;
    const applicant_id = req?.user?.id as string;
    const result = await applicationService.applyToJob(job_id, applicant_id, cover_letter) ;
    res.status(200).json(ApiResponse.success("Job Applied", result));
  } catch (error:any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

export const getByJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const job_id = req?.params?.id as string;
    const userId = req?.user?.id as string;
    const result = await applicationService.getApplicationByJob(job_id, userId);
    res.status(200).json(ApiResponse.success("Applied by job", result));
  } catch (error:any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

export const getByApplicant = async (req: Request, res: Response): Promise<void> => {
  try {
    const applicant_id = req?.user?.id as string;
    const result =
      await applicationService.getApplicationsByApplicant(applicant_id);
    res.status(200).json(ApiResponse.success("application successful", result));
  } catch (error:any ) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req?.params?.id as string;
    const status = req?.body.status;
    const userId = req?.user?.id as string;
    const result = await applicationService.updateApplicationStatus(
      id,
      status,
      userId,
    );
    res.status(200).json(ApiResponse.success("status changed", result));
  } catch (error:any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

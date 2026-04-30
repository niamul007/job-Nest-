import { Request, Response } from "express";
import * as companyServices from "../services/company.service";
import ApiResponse from "../utils/ApiResponse";

/**
 * Company controller — HTTP layer between routes and company service.
 * Extracts request data, calls service, sends response.
 * No business logic here — ownership checks happen in the service layer.
 */

/**
 * POST /api/companies
 * Creates a new company owned by the authenticated employer.
 * owner_id comes from req.user (set by protect middleware) — never from req.body.
 * This prevents users from creating companies on behalf of others.
 */
export const create = async (req: Request, res: Response) => {
  try {
    const { name, description, website, logo_url } = req.body;
    const owner_id = req?.user?.id as string; // set by protect middleware after JWT verification
    if (!owner_id) throw new Error("Not authorized");

    const newCompany = await companyServices.createCompany(
      name, description, website, logo_url, owner_id
    );
    res.status(201).json(ApiResponse.success("Company created successfully", newCompany));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

/**
 * GET /api/companies
 * Public route — returns all companies, no auth required.
 */
export const getAll = async (req: Request, res: Response) => {
  try {
    const companies = await companyServices.getAllCompanies();
    res.status(200).json(ApiResponse.success("Companies fetched successfully", companies));
  } catch (error) {
    res.status(400).json(ApiResponse.error("Companies not found"));
  }
};

/**
 * GET /api/companies/:id
 * Returns a single company by UUID.
 * Service throws if company doesn't exist.
 */
export const getOne = async (req: Request, res: Response) => {
  try {
    const id = req?.params?.id as string;
    if (!id) throw new Error("ID not found");
    const company = await companyServices.getCompanyById(id);
    res.status(200).json(ApiResponse.success("Company found", company));
  } catch (error) {
    res.status(400).json(ApiResponse.error("Company not found"));
  }
};

/**
 * PUT /api/companies/:id
 * Updates a company's content fields.
 * userId passed to service for ownership verification — only owner can update.
 * Uses COALESCE in model so only provided fields are changed.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const id = req?.params?.id as string;
    const userId = req?.user?.id as string;
    if (!id || !userId) throw new Error("Not authorized");

    const { name, description, website, logo_url } = req?.body;
    const updated = await companyServices.updateCompany(id, userId, {
      name, description, website, logo_url
    });
    // ✅ fixed: was incorrectly saying "Company deleted" and returning null
    res.status(200).json(ApiResponse.success("Company updated successfully", updated));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

/**
 * DELETE /api/companies/:id
 * Permanently deletes a company and cascades to all its jobs and applications.
 * userId passed to service for ownership verification — only owner can delete.
 */
export const remove = async (req: Request, res: Response) => {
  try {
    const id = req?.params?.id as string;
    const userId = req?.user?.id as string;
    await companyServices.deleteCompany(id, userId);
    // ✅ fixed: was 203, standard success is 200 for delete confirmation
    res.status(200).json(ApiResponse.success("Company deleted successfully", null));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};
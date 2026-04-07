import { Request, Response } from "express";
import * as companyServices from "../services/company.service";
import ApiResponse from "../utils/ApiResponse";

export const create = async (req: Request, res: Response) => {
  try {
    const { name, description, website, logo_url } = req.body;
    const owner_id = req?.user?.id;
    if (!owner_id) throw new Error("Not authorized");
    const newCompany = await companyServices.createCompany(
      name,
      description,
      website,
      logo_url,
      owner_id,
    );
    res
      .status(201)
      .json(ApiResponse.success("Company created successfully", newCompany));
  } catch (error: any) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const getCompanies = await companyServices.getAllCompanies();
    res
      .status(200)
      .json(ApiResponse.success("Response Successfull", getCompanies));
  } catch (error) {
    res.status(400).json(ApiResponse.error("Company not found"));
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const id = req?.params?.id as string;
    if (!id) {
      throw new Error("ID NOT FOUND");
    }
    const getCompany = await companyServices.getCompanyById(id);
    res.status(200).json(ApiResponse.success("Company found", getCompany));
  } catch (error) {
    res.status(400).json(ApiResponse.error("company not found"));
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = req?.params?.id as string;
    const userId = req?.user?.id;
    if (!id || !userId) throw new Error("Not authorized");
    const { name, description, website, logo_url } = req?.body;
    const update = await companyServices.updateCompany(id, userId, {
      name,
      description,
      website,
      logo_url,
    });
    res.status(200).json(ApiResponse.success("Company deleted", null));
  } catch (error) {
    res.status(400).json(ApiResponse.error("company isn't updated"));
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = req?.params?.id as string;
    const userId = req?.user?.id as string;
    const deleteCompany = await companyServices.deleteCompany(id, userId);
    res.status(203).json(ApiResponse.success("company deleted", deleteCompany));
  } catch (error) {
    res.status(400).json(ApiResponse.error("company didn't removed"));
  }
};

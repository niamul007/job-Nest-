import * as companyModel from "../models/company.model";

// CREATE — owner_id comes from logged in user
export async function createCompany(
  name: string,
  description: string,
  website: string,
  logo_url: string,
  owner_id: string,
) {
  const newCompany = await companyModel.createCompany(
    name, description, website, logo_url, owner_id
  );
  return newCompany;
}

// GET ALL — no checks needed, public
export async function getAllCompanies() {
  return await companyModel.findAllCompanies();
}

// GET ONE — just check if it exists
export async function getCompanyById(id: string) {
  const existing = await companyModel.findCompanyById(id);
  if (!existing) throw new Error("Company not found");
  return existing;
}

// UPDATE — find company, check ownership, then update
export async function updateCompany(id: string, userId: string, data: any) {
  const existing = await companyModel.findCompanyById(id);
  if (!existing) throw new Error("Company not found");
  if (existing.owner_id !== userId) throw new Error("Not authorized");
  return await companyModel.updateCompany(id, data);
}

// DELETE — find company, check ownership, then delete
export async function deleteCompany(id: string, userId: string) {
  const existing = await companyModel.findCompanyById(id);
  if (!existing) throw new Error("Company not found");
  if (existing.owner_id !== userId) throw new Error("Not authorized");
  await companyModel.deleteCompany(id);
}
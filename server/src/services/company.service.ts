import * as companyModel from "../models/company.model";

/**
 * Company service — business logic layer for company operations.
 * Simpler than job service — no caching, no approval lifecycle.
 * Main responsibility: ownership verification before mutations.
 */

/**
 * Creates a new company owned by the requesting user.
 * owner_id comes from req.user.id (set by protect middleware) — not from request body.
 * No pre-checks needed — any authenticated employer can create a company.
 */
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

/**
 * Returns all companies — public, no auth required.
 * No caching needed — company list is small and changes infrequently.
 */
export async function getAllCompanies() {
  return await companyModel.findAllCompanies();
}

/**
 * Returns a single company by ID.
 * Throws if not found — controller doesn't need to handle null checks.
 */
export async function getCompanyById(id: string) {
  const existing = await companyModel.findCompanyById(id);
  if (!existing) throw new Error("Company not found");
  return existing;
}

/**
 * Updates a company's content fields.
 * Ownership check: only the employer who created the company can update it.
 * Uses COALESCE in model — only provided fields are changed.
 */
export async function updateCompany(id: string, userId: string, data: any) {
  const existing = await companyModel.findCompanyById(id);
  if (!existing) throw new Error("Company not found");
  if (existing.owner_id !== userId) throw new Error("Not authorized");
  return await companyModel.updateCompany(id, data);
}

/**
 * Permanently deletes a company and all its associated jobs (via DB CASCADE).
 * Ownership check: only the employer who created the company can delete it.
 */
export async function deleteCompany(id: string, userId: string) {
  const existing = await companyModel.findCompanyById(id);
  if (!existing) throw new Error("Company not found");
  if (existing.owner_id !== userId) throw new Error("Not authorized");
  await companyModel.deleteCompany(id);
}
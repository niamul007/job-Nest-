import { pool } from "../config/db";
import { Company } from "../types";

/**
 * Company model — data access layer for the companies table.
 * Pure database operations with no business logic.
 * Uses parameterized queries throughout to prevent SQL injection.
 */

/**
 * Creates a new company and links it to the employer who created it.
 * owner_id is set once at creation and never updated — ownership cannot be transferred.
 * RETURNING * gives back the full created row without a second query.
 */
export async function createCompany(
  name: string,
  description: string,
  website: string,
  logo_url: string,
  owner_id: string,
): Promise<Company> {
  const sql =
    "INSERT INTO companies (name,description,website,logo_url,owner_id) VALUES ($1,$2,$3,$4,$5) RETURNING *";
  const result = await pool.query(sql, [name, description, website, logo_url, owner_id]);
  return result.rows[0];
}

/**
 * Finds a single company by UUID.
 * Used heavily by job service to verify company existence and ownership.
 * Returns undefined if not found — caller should check with if(!company).
 */
export async function findCompanyById(id: string): Promise<Company | null> {
  const sql = "SELECT * FROM companies WHERE id = $1";
  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

/**
 * Returns all companies — no filters needed.
 * Company list is small enough that filtering/pagination isn't required.
 */
export async function findAllCompanies(): Promise<Company[]> {
  const sql = "SELECT * FROM companies";
  const result = await pool.query(sql);
  return result.rows;
}

/**
 * Partially updates a company's content fields.
 * COALESCE keeps existing values for any field not provided in the update.
 * owner_id is intentionally excluded — company ownership cannot be changed.
 */
export async function updateCompany(id: string, data: any): Promise<Company> {
  const { name, description, website, logo_url } = data;
  const sql = `
    UPDATE companies SET
    name        = COALESCE($1, name),
    description = COALESCE($2, description),
    website     = COALESCE($3, website),
    logo_url    = COALESCE($4, logo_url)
    WHERE id = $5
    RETURNING *
  `;
  const result = await pool.query(sql, [name, description, website, logo_url, id]);
  return result.rows[0];
}

/**
 * Permanently deletes a company by ID.
 * Note: deleting a company may orphan its jobs if no CASCADE is set in the DB schema.
 * Returns void — caller only needs to know it succeeded or threw an error.
 */
export async function deleteCompany(id: string): Promise<void> {
  const sql = "DELETE FROM companies WHERE id = $1";
  await pool.query(sql, [id]);
}
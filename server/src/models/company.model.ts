import { pool } from "../config/db";
import { Company } from "../types";

export async function createCompany(
  name: string,
  description: string,
  website: string,
  logo_url: string,
  owner_id: string,
): Promise<Company> {
  const sql =
    "INSERT INTO companies (name,description,website,logo_url,owner_id) VALUES ($1,$2,$3,$4,$5) RETURNING *";
  const result = await pool.query(sql, [
    name,
    description,
    website,
    logo_url,
    owner_id,
  ]);
  return result.rows[0];
}

export async function findCompanyById(id: string): Promise<Company | null> {
  const sql = "SELECT * FROM companies WHERE id = $1 ";
  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

export async function findAllCompanies(): Promise<Company[]> {
  const sql = "SELECT * FROM companies ";
  const result = await pool.query(sql);
  return result.rows;
}

export async function updateCompany(id: string, data: any): Promise<Company> {
  const { name, description, website, logo_url } = data;
  const sql = `UPDATE companies SET 
  name = COALESCE($1, name),
  description = COALESCE($2, description),
  website = COALESCE($3, website),
  logo_url = COALESCE($4, logo_url)
  WHERE id = $5
  RETURNING *
    `;

  const result = await pool.query(sql, [
    name,
    description,
    website,
    logo_url,
    id,
  ]);
  return result.rows[0];
}

export async function deleteCompany(id: string): Promise<void> {
  const sql = "DELETE FROM companies WHERE id = $1 ";
  await pool.query(sql, [id]);
  return;
}

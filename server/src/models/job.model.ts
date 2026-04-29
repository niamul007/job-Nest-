import { pool } from "../config/db";
import { Job } from "../types";

/**
 * Job model — data access layer for the jobs table.
 * All functions here are pure database operations with no business logic.
 * Uses parameterized queries ($1, $2...) throughout to prevent SQL injection.
 */

/**
 * Inserts a new job into the database with status defaulting to 'draft'.
 * RETURNING * gives back the full created row without a second query.
 */
export async function createJob(
  company_id: string,
  title: string,
  description: string,
  location: string,
  type: string,
  category: string,
  salary_min: number,
  salary_max: number,
): Promise<Job> {
  const sql =
    "INSERT INTO jobs (company_id, title, description, location, type, category, salary_min, salary_max) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *";
  const result = await pool.query(sql, [
    company_id,
    title,
    description,
    location,
    type,
    category,
    salary_min,
    salary_max,
  ]);
  return result.rows[0];
}

/**
 * Finds a single job by its UUID.
 * Returns null if not found — lets the caller decide how to handle it.
 */
export async function findJobById(id: string): Promise<Job | null> {
  const sql = `SELECT * FROM jobs WHERE id = $1`;
  const result = await pool.query(sql, [id]);
  return result.rows[0] || null;
}

/**
 * Returns all active jobs with optional filters.
 * Builds the SQL query dynamically based on which filters are provided.
 * The count variable tracks parameter numbers ($1, $2...) as filters are added.
 */
export async function findAllJobs(filters?: {
  category?: string;
  type?: string;
  salary_min?: number;
}): Promise<Job[]> {
  let sql = `SELECT * FROM jobs WHERE status = 'active'`;
  const values: any[] = [];
  let count = 1;

  // Each filter appends an AND clause only if the value was provided
  if (filters?.category) {
    sql += ` AND category = $${count}`;
    values.push(filters.category);
    count++;
  }

  if (filters?.type) {
    sql += ` AND type = $${count}`;
    values.push(filters.type);
    count++;
  }

  if (filters?.salary_min) {
    sql += ` AND salary_min >= $${count}`;
    values.push(filters.salary_min);
    count++;
  }

  const result = await pool.query(sql, values);
  return result.rows;
}

/**
 * Partially updates a job — only fields provided in data are changed.
 * COALESCE($n, column) keeps the existing value when the new value is null,
 * preventing unintended data loss on partial updates.
 */
export async function updateJob(id: string, data: any): Promise<Job> {
  const { title, description, location, type, category, salary_min, salary_max } = data;
  const sql = `
    UPDATE jobs SET
    title = COALESCE($1, title),
    description = COALESCE($2, description),
    location = COALESCE($3, location),
    type = COALESCE($4, type),
    category = COALESCE($5, category),
    salary_min = COALESCE($6, salary_min),
    salary_max = COALESCE($7, salary_max)
    WHERE id = $8
    RETURNING *
  `;
  const result = await pool.query(sql, [
    title, description, location, type, category, salary_min, salary_max, id,
  ]);
  return result.rows[0];
}

/**
 * Permanently deletes a job by ID.
 * Returns void — the caller only needs to know it succeeded or threw an error.
 */
export async function deleteJob(id: string): Promise<void> {
  const sql = `DELETE FROM jobs WHERE id = $1`;
  await pool.query(sql, [id]);
}

/**
 * Updates only the status field of a job.
 * Used by submit (draft→pending) and approve (pending→active) flows.
 * Separate from updateJob to keep status changes explicit and controlled.
 */
export async function updateJobStatus(id: string, status: string) {
  const sql = `UPDATE jobs SET status = $1 WHERE id = $2 RETURNING *`;
  const result = await pool.query(sql, [status, id]);
  return result.rows[0];
}

/**
 * Returns all jobs belonging to a specific company, newest first.
 */
export async function findJobsByCompany(company_id: string): Promise<Job[]> {
  const sql = `SELECT * FROM jobs WHERE company_id = $1 ORDER BY created_at DESC`;
  const result = await pool.query(sql, [company_id]);
  return result.rows;
}

/**
 * Returns all jobs with status 'pending' — used by admin to review submissions.
 */
export async function findPendingJobs(): Promise<Job[]> {
  const sql = `SELECT * FROM jobs WHERE status = 'pending' ORDER BY created_at DESC`;
  const result = await pool.query(sql);
  return result.rows;
}
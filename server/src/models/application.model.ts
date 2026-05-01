import { Application } from "../types/index";
import { pool } from "../config/db";

/**
 * Application model — data access layer for the applications table.
 * Pure SQL queries, no business logic.
 * Uses parameterized queries throughout to prevent SQL injection.
 */

/**
 * Creates a new job application.
 * status defaults to 'pending' via DB default — not set explicitly here.
 * RETURNING * gives back the full created row without a second query.
 */
export async function createApplication(
  job_id: string,
  applicant_id: string,
  cover_letter: string
): Promise<Application> {
  const sql = `
    INSERT INTO applications (job_id, applicant_id, cover_letter)
    VALUES ($1, $2, $3) RETURNING *;
  `;
  const result = await pool.query(sql, [job_id, applicant_id, cover_letter]);
  return result.rows[0];
}

/**
 * Finds a single application by UUID.
 * Returns null if not found — caller handles the missing case.
 */
export async function findApplicationById(id: string): Promise<Application | null> {
  const sql = `SELECT * FROM applications WHERE id = $1`;
  const result = await pool.query(sql, [id]);
  return result.rows[0] || null;
}

/**
 * Returns all applications submitted by a specific applicant.
 * Used by applicants to view their own application history.
 */
export async function findApplicationsByApplicant(applicant_id: string): Promise<Application[]> {
  const sql = `SELECT * FROM applications WHERE applicant_id = $1`;
  const result = await pool.query(sql, [applicant_id]);
  return result.rows;
}

/**
 * Checks if an applicant has already applied to a specific job.
 * Both job_id AND applicant_id must match — prevents duplicate applications.
 * Returns array — service checks if length > 0 to determine duplicate.
 */
export async function findExistingApplication(
  job_id: string,
  applicant_id: string
): Promise<Application[]> {
  const sql = `
    SELECT * FROM applications
    WHERE job_id = $1 AND applicant_id = $2;
  `;
  const result = await pool.query(sql, [job_id, applicant_id]);
  return result.rows;
}

/**
 * Updates only the status field of an application.
 * Full application content (cover letter, job, applicant) is locked after submission.
 * Status lifecycle: pending → reviewed → accepted | rejected
 */
export async function updateApplicationStatus(id: string, status: string): Promise<Application> {
  const sql = `UPDATE applications SET status = $1 WHERE id = $2 RETURNING *`;
  const result = await pool.query(sql, [status, id]);
  return result.rows[0];
}

/**
 * Returns all applications for a specific job listing.
 * Used by employers to review everyone who applied to their job.
 */
export async function findApplicationsByJob(job_id: string): Promise<Application[]> {
  const sql = `SELECT * FROM applications WHERE job_id = $1`;
  const result = await pool.query(sql, [job_id]);
  return result.rows;
}
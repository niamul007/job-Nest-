import { pool } from "../config/db";
import { Job } from "../types";

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

export async function findJobById(id: string): Promise<Job | null> {
  const sql = `SELECT * FROM jobs WHERE id = $1`;
  const result = await pool.query(sql, [id]);
  return result.rows[0] || null;
}

export async function findAllJobs(filters?: {
  category?: string;
  type?: string;
  salary_min?: number;
}): Promise<Job[]> {
  let sql = `SELECT * FROM jobs WHERE status = 'active'`;
  const values: any[] = [];
  let count = 1;

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


export async function updateJob(id: string, data: any): Promise<Job> {
  const {
    title,
    description,
    location,
    type,
    category,
    salary_min,
    salary_max,
  } = data;
  const sql = `
    UPDATE jobs SET
    title = COALESCE($1,title),
    description = COALESCE ($2, description),
    location = COALESCE ($3, location),
    type = COALESCE ($4, type),
    category = COALESCE ($5, category),
    salary_min = COALESCE ($6, salary_min),
    salary_max = COALESCE ($7, salary_max)
    WHERE id = $8
    RETURNING *
    `;
  const result = await pool.query(sql, [
    title,
    description,
    location,
    type,
    category,
    salary_min,
    salary_max,
    id,
  ]);
  return result.rows[0];
}

export async function deleteJob(id: string): Promise<void> {
  const sql = `DELETE FROM jobs WHERE id = $1`;
  await pool.query(sql, [id]);
  return;
}

export async function updateJobStatus(id: string, status: string) {
  const sql = `UPDATE jobs SET status = $1 WHERE id = $2 RETURNING *`;
  const result = await pool.query(sql, [status, id]);
  return result.rows[0];
}

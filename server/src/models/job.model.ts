import { pool } from "../config/db"
export async function createJob(
  company_id: string,
  title: string,
  description: string,
  location: string,
  type: string,
  category: string,
  salary_min: number,
  salary_max: number,
) {
    const sql = `
        INSERT INTO jobs (company_id,title,description,location,type,category,salary_min,salary_max,owner_id)
    `
    const result = await pool.query(sql,[company_id,title,description,location,type,category,salary_min,salary_max]);
    return result.rows[0];
}


export async function findJobById(id:string) {
    const sql = `SELECT * FROM jobs WHERE id = $1`;
    const result = await pool.query(sql,[id]);
    return result.rows[0];
}

export async function findAllJobs() {
    const sql = 'SELECT * FROM jobs'
    const result = await pool.query(sql);
    return result.rows;
}

export async function updateJob(id: string , data: any) {
    const {title,description,location,type,category,salary_min,salary_max} = data;
    const sql = `
    UPDATE jobs SET
    title = COALESCE($1,title),
    description = COALESCE ($2, description),
    location = COALESCE ($3, location),
    type = COALESCE ($4, type),
    category = COALESCE ($5, category),
    salary_min = COALESCE ($6, salary_min),
    salary_max = COALESCE ($7, salary_max)
    `
    const result = await pool.query(sql,[title,description,location,type,category,salary_min,salary_max,id]);
    return result.rows[0];
}

export async function deleteJob(id: string) {
    const sql = `DELETE FROM jobs WHERE id = $1`;
    await pool.query(sql,[id]);
    return;
}

export async function updateJobStatus(id: string, status: string) {
    const sql = `UPDATE jobs SET status = $1 WHERE id = $2 RETURNING *`;
    const result = await pool.query(sql,[status,id]);
    return result.rows[0];
}
// Exactly — protect + authorize('admin') on the approval route. ✅
// Now let's start. Open src/models/job.model.ts and write these functions:

// createJob(company_id, title, description, location, type, category, salary_min, salary_max, owner_id)
// findJobById(id)
// findAllJobs(filters?) — optional filters for category, type, salary
// updateJob(id, data)
// deleteJob(id)
// updateJobStatus(id, status) — separate function just for status changes

// export interface Job {
//   id: string;
//   company_id: string;
//   title: string;
//   description: string;
//   location: string;
//   type: JobType;
//   category: string;
//   salary_min?: number;
//   salary_max?: number;
//   status: JobStatus;
//   created_at: Date;
// }

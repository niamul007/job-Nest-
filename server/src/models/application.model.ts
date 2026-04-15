import { Application } from "../types/index"; 
import {pool} from "../config/db"

export async function createApplication(job_id: string, applicant_id: string ,cover_letter:string): Promise<Application> {
    const sql = `
    INSERT INTO applications 
    (job_id,applicant_id,cover_letter)
     VALUES ($1,$2,$3) RETURNING * ;
    `
    const result = await pool.query(sql,[job_id,applicant_id,cover_letter]);
    return result.rows[0];
}

export async function findApplicationById(id: string): Promise<Application | null> {
    const sql = `
    SELECT  * FROM applications WHERE id = $1
    `
    const result = await pool.query(sql,[id]);
    return result.rows[0] || null;
}


export async function findApplicationsByApplicant(applicant_id:string): Promise<Application[]> {
    const sql = `
    SELECT * FROM applications WHERE applicant_id = $1;
    `
    const result = await pool.query(sql,[applicant_id]);
    return result.rows;
}

export async function findExistingApplication(job_id: string , applicant_id: string): Promise<Application[]> {
    const sql = `
    SELECT * FROM applications 
    WHERE job_id = $1 AND applicant_id = $2;
    `
    const result = await pool.query(sql,[job_id,applicant_id]);
    return result.rows;
}


export async function updateApplicationStatus(id: string , status: string): Promise<Application> {
    const sql = 'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *'
    const result = await pool.query(sql,[status,id]);
    return result.rows[0]
}


export async function findApplicationsByJob(job_id: string): Promise<Application[]> {
    const sql = 'SELECT * FROM applications WHERE job_id = $1';
    const result = await pool.query(sql,[job_id]);
    return result.rows;
}

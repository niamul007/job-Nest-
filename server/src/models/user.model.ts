import { pool } from "../config/db"
import { User } from "../types";

export async function findByEmail(email:string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = $1'
    const result = await pool.query(sql,[email]);
    return result.rows[0];
}

export async function createUser(name: string ,email:string,password:string,role:string): Promise<User> {
    const sql = 'INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING *';
    const result = await pool.query(sql,[name,email,password,role]);
    return result.rows[0];
}
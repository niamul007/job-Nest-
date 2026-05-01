import { pool } from "../config/db";
import { User } from "../types";

/**
 * User model — data access layer for the users table.
 * Critical security rule throughout:
 *   password hash is ONLY returned by findByEmailWithPassword (needed for login)
 *   all other functions explicitly exclude password from results
 */

/**
 * Finds a user by email INCLUDING the password hash.
 * Only used during login to compare the submitted password against the stored hash.
 * Never use this function to return user data to the frontend.
 */
export async function findByEmailWithPassword(email: string): Promise<User | null> {
  const sql = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(sql, [email]);
  return result.rows[0];
}

/**
 * Creates a new user account.
 * RETURNING explicitly lists safe columns — password hash is excluded
 * even though it was just inserted, it is never returned to the caller.
 */
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: string
): Promise<User> {
  const sql = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
  `;
  // password excluded from RETURNING — hash never leaves the database
  const result = await pool.query(sql, [name, email, password, role]);
  return result.rows[0];
}

/**
 * Finds a user by UUID — safe version, no password returned.
 * Used by application service to get applicant details for notifications.
 * Returns null if not found.
 */
export async function findUserById(id: string): Promise<User | null> {
  // Explicitly select only safe columns — never SELECT * on users table
  const sql = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1';
  const result = await pool.query(sql, [id]);
  return result.rows[0] || null;
}
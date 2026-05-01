import bcrypt from "bcryptjs";
import { createUser, findByEmailWithPassword } from "../models/user.model";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../types";

/**
 * Auth service — handles user registration and login.
 * Responsible for:
 *   - Password hashing (bcrypt)
 *   - Password verification (bcrypt.compare)
 *   - JWT token generation (jsonwebtoken)
 *   - Ensuring password hash never leaves this service
 */

/**
 * Registers a new user account.
 * Flow:
 *   1. Check email not already taken
 *   2. Hash password with bcrypt (10 salt rounds — industry standard)
 *   3. Create user in DB (password stored as hash, never plain text)
 *   4. Generate JWT token so user is logged in immediately after register
 *   5. Strip password from response before returning
 */
export async function register(
  name: string,
  email: string,
  password: string,
  role: UserRole,
) {
  // Prevent duplicate accounts
  const userExists = await findByEmailWithPassword(email);
  if (userExists) throw new Error("User already exists");

  // Hash password — 10 salt rounds is industry standard
  // Never store plain text passwords
  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await createUser(name, email, hashPassword, role);

  // Generate JWT — user is logged in immediately after registering
  // Payload contains only what's needed for auth (id, email, role)
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    env.jwt.secret as Secret,
    { expiresIn: env.jwt.expiresIn } as SignOptions
  );

  // Strip password hash from response using destructuring
  // _ is a convention for "extracted but not needed"
  const { password: _, ...safeUser } = newUser;
  return { token, user: safeUser };
}

/**
 * Authenticates an existing user.
 * Flow:
 *   1. Find user by email (needs password hash for comparison)
 *   2. Compare submitted password against stored hash using bcrypt
 *   3. Generate JWT token on successful match
 *   4. Strip password from response before returning
 *
 * bcrypt.compare() never decrypts — it hashes the attempt
 * the same way and compares results.
 */
export async function login(email: string, password: string) {
  // Get user with password hash — only place this is needed
  const user = await findByEmailWithPassword(email);
  if (!user) throw new Error("User not found");

  // Compare submitted password against stored hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwt.secret as Secret,
    { expiresIn: env.jwt.expiresIn } as SignOptions
  );

  // Strip password hash before returning
  const { password: _, ...safeUser } = user;
  return { token, user: safeUser };
}
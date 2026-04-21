import bcrypt from "bcryptjs";
import { createUser, findByEmailWithPassword } from "../models/user.model";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../types";

export async function register(
  name: string,
  email: string,
  password: string,
  role: UserRole, // ✅ enum instead of string
) {
  const userExists = await findByEmailWithPassword(email);
  if (userExists) {
    throw new Error("User already exists");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await createUser(name, email, hashPassword, role);

  // ✅ generate token after register
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    env.jwt.secret as Secret,
    { expiresIn: env.jwt.expiresIn } as SignOptions
  );

  // ✅ remove password before returning
  const { password: _, ...safeUser } = newUser;
  return { token, user: safeUser };
}

export async function login(email: string, password: string) {
  const user = await findByEmailWithPassword(email);
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwt.secret as Secret,
    { expiresIn: env.jwt.expiresIn } as SignOptions // ✅ use env instead of hardcoded "1h"
  );

  const { password: _, ...safeUser } = user;
  return { token, user: safeUser };
}
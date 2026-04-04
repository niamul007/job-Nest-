import bcrypt from "bcryptjs";
import { findByEmail, createUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../types";

export async function register(
  name: string,
  email: string,
  password: string,
  role: string,
) {
  const userExists = await findByEmail(email);
  if (userExists) {
    throw new Error("User already exists");
  }
  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await createUser(name, email, hashPassword, role);
  return newUser;
}

export async function login(email: string, password: string) {
  const user = await findByEmail(email);
  if (!user) throw new Error("User not found");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwt.secret,
    { expiresIn: "1h" },
  );
  return { token, user };
}

import bcrypt from "bcryptjs";
import { createUser, findByEmailWithPassword } from "../models/user.model";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export async function register(
  name: string,
  email: string,
  password: string,
  role: string,
) {
  const userExists = await findByEmailWithPassword(email);
  if (userExists) {
    throw new Error("User already exists");
  }
  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await createUser(name, email, hashPassword, role);
  return newUser;
}


export async function login(email: string, password: string) {
  const user = await findByEmailWithPassword(email);
  if (!user) throw new Error("User not found");
  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwt.secret,
    { expiresIn: "1h" }
  );

  // Remove password before returning
  const { password: _, ...safeUser } = user;
  return { token, user: safeUser };
}
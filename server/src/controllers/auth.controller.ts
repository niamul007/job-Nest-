import * as auth from '../services/auth.service';
import { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';

/**
 * Auth controller — handles registration and login HTTP requests.
 * Thinnest controller in the app — all logic lives in auth service.
 * No req.user here — these routes create the token, not consume it.
 * No protect middleware — these are the only public auth endpoints.
 */

/**
 * POST /api/auth/register
 * Creates a new user account and returns a JWT token.
 * All data comes from req.body — user is anonymous at this point.
 * Service handles: duplicate check, password hashing, token generation.
 * Returns 201 — a new user resource was created.
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const newUser = await auth.register(name, email, password, role);
    res.status(201).json(ApiResponse.success("User registered successfully", newUser));
  } catch (err: any) {
    if (err.message === 'User already exists') {
      res.status(400).json(ApiResponse.error(err.message));
      return;
    }
    res.status(500).json(ApiResponse.error("Registration failed. Please try again."));
  }
};

/**
 * POST /api/auth/login
 * Authenticates an existing user and returns a JWT token.
 * Service handles: user lookup, password comparison, token generation.
 * Returns 200 — no new resource created, just authenticating.
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await auth.login(email, password);
    res.status(200).json(ApiResponse.success("User login successfully", result));
  } catch (err: any) {
    if (err.message === 'User not found' || err.message === 'Invalid credentials') {
      res.status(401).json(ApiResponse.error(err.message));
      return;
    }
    res.status(500).json(ApiResponse.error("Login failed. Please try again."));
  }
};
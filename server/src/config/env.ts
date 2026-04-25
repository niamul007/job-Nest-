// This file reads all environment variables from .env
// and validates them at startup. If anything is missing,
// the app will throw an error immediately instead of
// crashing later in a confusing way.

import dotenv from "dotenv";

// Load the .env file into process.env
dotenv.config();

// This function checks if a variable exists and returns it
// If it doesn't exist, it throws a clear error
const get = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

// We export a single object with all our env variables
// The rest of the app imports from here — never from process.env directly
export const env = {
  // Server
  port: parseInt(get("PORT"), 10), // convert string to number
  nodeEnv: get("NODE_ENV"),

  database: {
    url: get("DATABASE_URL"),
  },

  // Redis
  redis: {
    host: get("REDIS_HOST"),
    port: parseInt(get("REDIS_PORT"), 10),
    username: get("REDIS_USERNAME"),
    password: get("REDIS_PASSWORD"),
  },

  // JWT
  jwt: {
    secret: get("JWT_SECRET"),
    expiresIn: get("JWT_EXPIRES_IN"),
  },

  // Email
  nodemailer: {
    host: get("EMAIL_HOST"),
    port: parseInt(get("EMAIL_PORT"), 10),
    user: get("EMAIL_USER"),
    pass: get("EMAIL_PASS"),
  },
};

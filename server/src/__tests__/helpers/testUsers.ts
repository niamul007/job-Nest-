import { randomBytes } from "crypto";
import request from "supertest";
import app from "../../app";
import { pool } from "../../config/db";
import { redisClient } from "../../config/redis";
import emailQueue from "../../queues/email.queue";

/**
 * Everything a test file creates is tracked here so afterAll can delete exactly
 * those rows and nothing else. Jest gives each test file its own copy of this module.
 */
const createdEmails: string[] = [];

export const tracked = {
  companyIds: [] as string[],
  jobIds: [] as string[],
  applicationIds: [] as string[],
};

export function trackEmail(email: string) {
  createdEmails.push(email);
}

/**
 * Deletes only the tracked rows (children first), then closes the pg pool,
 * the Redis client and the email queue so Jest can exit on its own.
 */
export async function cleanupAndClose() {
  try {
    if (tracked.applicationIds.length > 0) {
      await pool.query("DELETE FROM applications WHERE id = ANY($1::uuid[])", [tracked.applicationIds]);
    }
    if (tracked.jobIds.length > 0) {
      await pool.query("DELETE FROM jobs WHERE id = ANY($1::uuid[])", [tracked.jobIds]);
    }
    if (tracked.companyIds.length > 0) {
      await pool.query("DELETE FROM companies WHERE id = ANY($1::uuid[])", [tracked.companyIds]);
    }
    if (createdEmails.length > 0) {
      await pool.query("DELETE FROM users WHERE email = ANY($1::text[])", [createdEmails]);
    }
  } finally {
    await pool.end();
    await emailQueue.close();
    await redisClient.quit();
  }
}

/** Registers one extra employer (a different owner) and returns its token. */
export async function createSecondEmployer() {
  const runId = `${Date.now()}${randomBytes(4).toString("hex")}`;
  const password = `Aa1!${randomBytes(12).toString("hex")}`;
  const email = `employer2${runId}@example.com`;

  trackEmail(email);
  await request(app).post("/api/auth/register").send({
    name: "Second Employer",
    email,
    password,
    role: "employer",
  });
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });
  return { secondEmployerToken: res.body.data.token as string };
}

export async function createTestUsers() {
  const runId = `${Date.now()}${randomBytes(4).toString("hex")}`;
  const password = `Aa1!${randomBytes(12).toString("hex")}`;

  const employerEmail = `employer${runId}@example.com`;
  const applicantEmail = `applicant${runId}@example.com`;
  const adminEmail = `admin${runId}@example.com`;

  trackEmail(employerEmail);
  trackEmail(applicantEmail);
  trackEmail(adminEmail);

  await request(app).post("/api/auth/register").send({
    name: "Test Employer",
    email: employerEmail,
    password,
    role: "employer",
  });
  await request(app).post("/api/auth/register").send({
    name: "Test Applicant",
    email: applicantEmail,
    password,
    role: "applicant",
  });
  await request(app).post("/api/auth/register").send({
    name: "Test Admin",
    email: adminEmail,
    password,
    role: "applicant",
  });

  await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [
    adminEmail,
  ]);

  const employerRes = await request(app)
    .post("/api/auth/login")
    .send({ email: employerEmail, password });
  const applicantRes = await request(app)
    .post("/api/auth/login")
    .send({ email: applicantEmail, password });
  const adminRes = await request(app)
    .post("/api/auth/login")
    .send({ email: adminEmail, password });

  return {
    employerToken: employerRes.body.data.token as string,
    applicantToken: applicantRes.body.data.token as string,
    adminToken: adminRes.body.data.token as string,
  };
}

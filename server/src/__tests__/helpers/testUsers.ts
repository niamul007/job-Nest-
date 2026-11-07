import { randomBytes } from "crypto";
import request from "supertest";
import app from "../../app";
import { pool } from "../../config/db";

export async function createTestUsers() {
  const runId = `${Date.now()}${randomBytes(4).toString("hex")}`;
  const password = `Aa1!${randomBytes(12).toString("hex")}`;

  const employerEmail = `employer${runId}@example.com`;
  const applicantEmail = `applicant${runId}@example.com`;
  const adminEmail = `admin${runId}@example.com`;

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

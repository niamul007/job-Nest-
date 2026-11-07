import request from "supertest";
import app from "../app";
import { createTestUsers } from "./helpers/testUsers";

describe("Job Routes", () => {
  let employerToken: string;
  let companyId: string;
  let adminToken: string;
  let applicantToken: string;
  let jobId: string;

beforeAll(async () => {
  const tokens = await createTestUsers();
  employerToken = tokens.employerToken;
  adminToken = tokens.adminToken;
  applicantToken = tokens.applicantToken;

  const companyResponse = await request(app)
    .post("/api/companies")
    .set("Authorization", `Bearer ${employerToken}`)
    .send({
      name: "Test Company",
      description: "A company for testing",
      website: "https://testcompany.com",
    });
  console.log("company response:", JSON.stringify(companyResponse.body));
  companyId = companyResponse.body.data.id;
  console.log("companyId:", companyId);
});

  // ✅ tests are OUT here, not inside beforeAll
  it("should create a job", async () => {
    const response = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        title: "Test Job",
        description: "A job for testing",
        location: "Test City",
        type: "full-time",
        category: "Engineer",
        company_id: companyId,
      });
    expect(response.status).toBe(201);
    jobId = response.body.data.id;
    console.log("jobId saved:", jobId);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe("Test Job");
    jobId = response.body.data.id;
  });

  it("should get all jobs", async () => {
    const response = await request(app).get("/api/jobs");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

it("should approve job as admin", async () => {
  console.log("jobId:", jobId);

  await request(app)
    .patch(`/api/jobs/${jobId}/submit`)
    .set("Authorization", `Bearer ${employerToken}`);

  const response = await request(app)
    .patch(`/api/jobs/${jobId}/approve`)
    .set("Authorization", `Bearer ${adminToken}`)
    
  console.log("approve response:", JSON.stringify(response.body));
  
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
});

  it("shouldn't create job without token", async () => {
    const response = await request(app)
      .post("/api/jobs")
      .send({ title: "Test Job" });
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("shouldn't create job as applicant", async () => {
    const response = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${applicantToken}`)
      .send({
        title: "Test Job",
        company_id: companyId,
      });
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });
});

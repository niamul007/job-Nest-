import request from "supertest";
import app from "../app";

describe("Application routes", () => {
  let employerToken: string;
  let applicantToken: string;
  let companyId: string;
  let jobId: string;
  let adminToken: string;
  let applicationId: string;

  beforeAll(async () => {
    const adminResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@jobnest.com", password: "Admin1234!" });
    adminToken = adminResponse.body.data.token;

    const employerResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "testemployer@gmail.com", password: "Test1234!" });
    employerToken = employerResponse.body.data.token;

    const applicantResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "applicant123@gmail.com", password: "Test12345!" });
    applicantToken = applicantResponse.body.data.token;

    const companyResponse = await request(app)
      .post("/api/companies")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        name: "Test Company",
        description: "A company for testing",
        website: "https://testcompany.com",
      });
    companyId = companyResponse.body.data.id;

    const jobResponse = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        title: "Test job",
        description: "Test description",
        location: "dhaka",
        type: "full-time",
        category: "Engineer",
        salary_min: 50000,
        salary_max: 100000,
        company_id: companyId,
      });
    jobId = jobResponse.body.data.id;

    await request(app)
      .patch(`/api/jobs/${jobId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it("should applicant apply for a job", async () => {
    const response = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${applicantToken}`)
      .send({
        job_id: jobId,
        cover_letter: "I am very interested in this position.",
      });

    applicationId = response.body.data.id;
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.job_id).toBe(jobId);
  });

  it("should get the job applications for employer", async () => {
    const response = await request(app)
      .get(`/api/applications/job/${jobId}`)
      .set("Authorization", `Bearer ${employerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("should update application status by employer", async () => {
    const response = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set("Authorization", `Bearer ${employerToken}`)
      .send({ status: "accepted" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should not allow applicant to apply for the same job twice", async () => {
    const response = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${applicantToken}`)
      .send({
        job_id: jobId,
        cover_letter: "Applying again.",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("shouldn't allow to apply without token", async () => {
    const response = await request(app)
      .post("/api/applications")
      .send({
        job_id: jobId,
        cover_letter: "No token here.",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
import request from "supertest";
import app from "../app";
import { redisClient } from "../config/redis";
import { createTestUsers, createSecondEmployer, tracked, cleanupAndClose } from "./helpers/testUsers";

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
  tracked.companyIds.push(companyId);
  console.log("companyId:", companyId);
});

  // ✅ tests are OUT here, not inside beforeAll
  afterAll(async () => {
    await cleanupAndClose();
  });

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
    tracked.jobIds.push(jobId);
    console.log("jobId saved:", jobId);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe("Test Job");
    jobId = response.body.data.id;
  });

  it("should reject a job where salary_max is below salary_min", async () => {
    const response = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        title: "Bad Salary Job",
        description: "A job with a bad salary range",
        location: "Test City",
        type: "full-time",
        category: "Engineer",
        company_id: companyId,
        salary_min: 100000,
        salary_max: 50000,
      });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should get all jobs", async () => {
    const response = await request(app).get("/api/jobs");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

it("should approve job as admin", async () => {
  console.log("jobId:", jobId);

  const submitResponse = await request(app)
    .patch(`/api/jobs/${jobId}/submit`)
    .set("Authorization", `Bearer ${employerToken}`);

  expect(submitResponse.status).toBe(200);

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

  it("should send an active job back to pending when it is edited", async () => {
    const updateResponse = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        title: "Edited Title",
        description: "Edited description for testing",
        location: "Test City",
        type: "full-time",
        category: "Engineer",
        company_id: companyId,
      });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.status).toBe("pending");
  });

  it("should let the company owner list the company's jobs", async () => {
    const response = await request(app)
      .get(`/api/jobs/company/${companyId}`)
      .set("Authorization", `Bearer ${employerToken}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("should not let another employer list the company's jobs", async () => {
    const { secondEmployerToken } = await createSecondEmployer();
    const response = await request(app)
      .get(`/api/jobs/company/${companyId}`)
      .set("Authorization", `Bearer ${secondEmployerToken}`);
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Not authorized");
  });

  it("should hide a pending job from the public", async () => {
    const getResponse = await request(app).get(`/api/jobs/${jobId}`);
    expect(getResponse.status).toBe(404);
  });

  describe("when Redis fails", () => {
    let activeJobId: string;

    beforeAll(async () => {
      const created = await request(app)
        .post("/api/jobs")
        .set("Authorization", `Bearer ${employerToken}`)
        .send({
          title: "Redis Fallback Job",
          description: "A job for the Redis fallback tests",
          location: "Test City",
          type: "full-time",
          category: "Engineer",
          company_id: companyId,
        });
      activeJobId = created.body.data.id;
      tracked.jobIds.push(activeJobId);
      await request(app)
        .patch(`/api/jobs/${activeJobId}/submit`)
        .set("Authorization", `Bearer ${employerToken}`);
      const approved = await request(app)
        .patch(`/api/jobs/${activeJobId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(approved.status).toBe(200);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    function breakRedis() {
      const fail = () => Promise.reject(new Error("Redis down (test)"));
      jest.spyOn(redisClient, "get").mockImplementation(fail as never);
      jest.spyOn(redisClient, "setEx").mockImplementation(fail as never);
      jest.spyOn(redisClient, "keys").mockImplementation(fail as never);
      jest.spyOn(redisClient, "del").mockImplementation(fail as never);
      jest.spyOn(console, "error").mockImplementation(() => {});
    }

    it("should still list jobs from the database", async () => {
      breakRedis();
      const response = await request(app).get("/api/jobs");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should still return an active job by id", async () => {
      breakRedis();
      const response = await request(app).get(`/api/jobs/${activeJobId}`);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(activeJobId);
    });
  });
});

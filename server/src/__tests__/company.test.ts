import request from "supertest";
import app from "../app";
import { createTestUsers, tracked, cleanupAndClose } from "./helpers/testUsers";

describe("Company Routes", () => {
  let employerToken: string; // shared across all tests
  let companyId: string; // shared across all tests

  beforeAll(async () => {
    // login once, reuse token in all tests below
    const tokens = await createTestUsers();
    employerToken = tokens.employerToken;
  });

  afterAll(async () => {
    await cleanupAndClose();
  });

  it("should create a company", async () => {
    // token is already available here ✅

    const company = {
      name: "Test Company",
      description: "A company for testing",
      website: "https://testcompany.com",
      logo_url: "https://testcompany.com/logo.png",
    };
    const response = await request(app)
      .post("/api/companies")
      .set("Authorization", `Bearer ${employerToken}`)
      .send(company);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(company.name);
    companyId = response.body.data.id; // save for later tests
    tracked.companyIds.push(companyId);
  });

  it("should get all companies", async () => {
    // token is already available here too ✅
    const response = await request(app).get("/api/companies");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("should get a company by ID", async () => {
    // token is already available here too ✅
    const response = await request(app)
      .get(`/api/companies/${companyId}`)
      .set("Authorization", `Bearer ${employerToken}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(companyId);
  });

  it("should return 404 for a company that does not exist", async () => {
    const response = await request(app).get(
      "/api/companies/00000000-0000-4000-8000-000000000000",
    );
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("should return 400 for a malformed company id without leaking database text", async () => {
    const response = await request(app).get("/api/companies/not-a-uuid");
    expect(response.status).toBe(400);
    expect(response.body.message).not.toMatch(/uuid|syntax/i);
  });

  it("should reject a website that is not http or https", async () => {
    const response = await request(app)
      .post("/api/companies")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        name: "Bad Website Company",
        description: "A company with a bad website",
        website: "javascript:alert(1)",
      });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should reject a logo_url that is not http or https", async () => {
    const response = await request(app)
      .post("/api/companies")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        name: "Bad Logo Company",
        description: "A company with a bad logo",
        logo_url: "javascript:alert(1)",
      });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should accept a valid https logo_url", async () => {
    const response = await request(app)
      .post("/api/companies")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        name: "Https Logo Company",
        description: "A company with a good logo",
        logo_url: "https://testcompany.com/logo.png",
      });
    expect(response.status).toBe(201);
    if (response.body.data?.id) tracked.companyIds.push(response.body.data.id);
  });

  it("should accept a company with no logo_url (what the client sends for no logo)", async () => {
    // client does `logo_url: formData.logo_url || undefined`, so the key is omitted from the JSON
    const response = await request(app)
      .post("/api/companies")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        name: "No Logo Company",
        description: "A company without a logo",
      });
    expect(response.status).toBe(201);
    if (response.body.data?.id) tracked.companyIds.push(response.body.data.id);
  });

  it("should update a company", async () => {
    // token is already available here too ✅
    const updatedData = {
      name: "Updated Test Company",
      description: "An updated company for testing",
      website: "https://updatedtestcompany.com",
      logo_url: "https://updatedtestcompany.com/logo.png",
    };
    const response = await request(app)
      .put(`/api/companies/${companyId}`)
      .set("Authorization", `Bearer ${employerToken}`)
      .send(updatedData);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  it("shoudn't create a company without token", async () => {
    const company = {
      name: "Test Company",
      description: "A company for testing",
      website: "https://testcompany.com",
      logo_url: "https://testcompany.com/logo.png",
    };
    const response = await request(app).post("/api/companies").send(company);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

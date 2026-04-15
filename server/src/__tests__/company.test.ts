import request from "supertest";
import app from "../app";

describe("Company Routes", () => {
  let employerToken: string; // shared across all tests
  let companyId: string; // shared across all tests

  beforeAll(async () => {
    // login once, reuse token in all tests below
    const response = await request(app).post("/api/auth/login").send({
      email: "testemployer@gmail.com",
      password: "Test1234!",
    });
    employerToken = response.body.data.token;
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

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

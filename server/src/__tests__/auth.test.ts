import request from "supertest";
import app from "../app";
import { trackEmail, cleanupAndClose } from "./helpers/testUsers";

describe("Auth Routes", () => {
  afterAll(async () => {
    await cleanupAndClose();
  });

  it("should register a new user", async () => {
    const userData = {
      name: "Test User",
      email: `testuser${Date.now()}@example.com`,
      password: "Test1234!",
      role: "applicant",
    };

    trackEmail(userData.email);
    const response = await request(app)
      .post("/api/auth/register")
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    // expect(response.body.data.token).toBeDefined();
  });

  it("should login an existing user", async () => {
    const email = `loginuser${Date.now()}${Math.random().toString(36).slice(2, 8)}@example.com`;
    const password = `Aa1!${Math.random().toString(36).slice(2)}${Date.now()}`;
    trackEmail(email);

    await request(app)
      .post("/api/auth/register")
      .send({ name: "Login User", email, password, role: "applicant" });

    const loginData = { email, password };

    const response = await request(app).post("/api/auth/login").send(loginData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  it("should fail login with an unknown email", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: `nobody${Date.now()}${Math.random().toString(36).slice(2, 8)}@example.com`,
        password: "Whatever123!",
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid credentials");
  });

  it("should fail login with wrong password", async () => {
    const email = `wrongpw${Date.now()}${Math.random().toString(36).slice(2, 8)}@example.com`;
    const password = `Aa1!${Math.random().toString(36).slice(2)}${Date.now()}`;
    trackEmail(email);

    await request(app)
      .post("/api/auth/register")
      .send({ name: "Wrong Pw User", email, password, role: "applicant" });

    const loginData = { email, password: `${password}-wrong` };

    const response = await request(app).post("/api/auth/login").send(loginData);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

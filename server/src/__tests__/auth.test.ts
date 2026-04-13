import request from "supertest";
import app from "../app";

describe("Auth Routes", () => {
  it("should register a new user", async () => {
    const userData = {
      name: "Test User",
      email: "testuser@example.com",
      password: "Test1234!",
      role: "applicant",
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  it("should login an existing user", async () => {
    const loginData = {
      email: "testuser@example.com",
      password: "Test1234!",
    };

    const response = await request(app).post("/api/auth/login").send(loginData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  it("should fail login with wrong password", async () => {
    const loginData = {
      email: "testuser@example.com",
      password: "wrongpassword",
    };

    const response = await request(app).post("/api/auth/login").send(loginData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

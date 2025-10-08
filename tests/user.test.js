import request from "supertest";
import app from "../src/app.js"; // adjust path if needed
import prisma from "../src/utils/prismaClient.js";

describe("User API", () => {
  let adminToken = "";

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.user.deleteMany();

    // Create Admin User
    const adminRes = await request(app).post("/api/auth/register").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "ADMIN",
    });

    // Login to get token
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });

    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    await prisma.activityLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  test("✅ Should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "EMPLOYEE",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("userId");
  });

  test("✅ Should login user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "john@example.com",
        password: "password123",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("❌ Should reject invalid login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "fake@example.com",
        password: "wrongpassword",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

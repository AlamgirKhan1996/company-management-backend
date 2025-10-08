import request from "supertest";
import app from "../src/app.js"; // adjust path if needed
import prisma from "../src/utils/prismaClient.js";

beforeAll(async () => {
  await prisma.user.deleteMany(); // clean slate before tests
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Auth API", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
      role: "ADMIN",
    });

    console.log("Register response:", res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("userId");
  });

  it("should fail on invalid login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "notfound@example.com",
      password: "wrongpassword",
    });

    console.log("Login response:", res.body);
    expect(res.statusCode).toBe(400);
  });
});

import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/utils/prismaClient.js";
import jwt from "jsonwebtoken";
import { de } from "zod/locales";

let token;
let user;

beforeAll(async () => {
  // Create a fake user in the DB (admin or manager)
  const randomEmail = `testadmin_${Date.now()}@example.com`;
  user = await prisma.user.create({
    data: {
      name: "Test Admin",
      email: randomEmail,
      password: "hashedpassword", // mock, no bcrypt needed
      role: "ADMIN",
    },
  });

  // Generate JWT for auth
  token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
});

afterAll(async () => {
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.file.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("POST /api/projects", () => {
  it("should create a new project", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Backend Refactor",
        description: "Refactor core backend modules",
        startDate: "2025-10-10",
        endDate: "2025-12-10",
        status: "IN_PROGRESS",
        userId: user.id,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("project");
    expect(res.body.project.name).toBe("Backend Refactor");

    const log = await prisma.activityLog.findFirst({
      where: { action: "CREATE_PROJECT" },
    });
    expect(log).not.toBeNull();
  });
});

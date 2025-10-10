// tests/task.test.js
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/utils/prismaClient.js";

let token;
let projectId;
let userId;
let assignedToId;
let task;

beforeAll(async () => {
  // cleanup
 // Clean database safely
await prisma.task.deleteMany({});
await prisma.employee.deleteMany({});
await prisma.project.deleteMany({});
await prisma.department.deleteMany({});
await prisma.user.deleteMany({});


  // create a user
  const user = await prisma.user.create({
    data: {
      name: "TestAdmin",
      email: "testadmin@company.com",
      password: "123456",
      role: "ADMIN",
    },
  });
  userId = user.id;

  // generate token (you can mock this if needed)
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "testadmin@company.com", password: "123456" });
  token = loginRes.body.token;

  // create a department
  const dept = await prisma.department.create({
    data: {
      name: "Engineering",
      createdById: user.id,
    },
  });

  // create a project
  const project = await prisma.project.create({
    data: {
      name: "Project Alpha",
      startDate: new Date("2025-10-01"),
      endDate: new Date("2025-12-31"),
      status: "IN_PROGRESS",
      createdById: userId,
      departments: {
        connect: { id: dept.id },
      },
    },
  });
  projectId = project.id;
    assignedToId = userId; // assign to self for simplicity
    userId = user.id;
});

describe("Task API", () => {
  it("should create a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Setup CI/CD",
        description: "Configure pipeline for deployments",
        status: "TODO",
        projectId, // ✅ now defined
        assignedToId,
        userId,
        dueDate: "2025-11-01",
      });

    console.log("Task creation response:", res.body);
    task = res.body; // store for later tests
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Setup CI/CD");
  });

  it("should fetch all tasks", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should update a task", async () => {
    const updateRes = await request(app)
      .put(`/api/tasks/${task.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Setup CI/CD - Updated",
        description: "Configure pipeline for deployments - Updated",
        status: "IN_PROGRESS",
        dueDate: new Date("2025-11-15"),
        projectId,
        assignedToId,
      });
      console.log("Task update response:", updateRes.body);

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.title).toBe("Setup CI/CD - Updated");
  });
  it("should delete a task", async () => {

    const deleteRes = await request(app)
      .delete(`/api/tasks/${task.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toBe("Task deleted successfully");
  });
});

afterAll(async () => {
  // Clean database safely
await prisma.task.deleteMany({});
await prisma.employee.deleteMany({});
await prisma.project.deleteMany({});
await prisma.department.deleteMany({});
await prisma.user.deleteMany({});

});

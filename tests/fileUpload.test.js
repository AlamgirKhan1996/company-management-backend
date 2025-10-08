import request from "supertest";
import path from "path";
import app from "../src/app.js";
import prisma from "../src/utils/prismaClient.js";

describe("File Upload API", () => {
  let token = "";

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.user.deleteMany();

    await request(app).post("/api/auth/register").send({
      name: "Uploader",
      email: "uploader@example.com",
      password: "password123",
      role: "ADMIN",
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "uploader@example.com",
      password: "password123",
    });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    await prisma.file.deleteMany();
    
    await prisma.$disconnect();
  });

  test("✅ Should upload a file successfully", async () => {
    const filePath = path.join(process.cwd(), "tests", "testFile.txt");

    // create dummy file for upload
    const fs = await import("fs");
    fs.writeFileSync(filePath, "Test file upload content");

    const res = await request(app)
      .post("/api/files/upload") // your upload route
      .set("Authorization", `Bearer ${token}`)
      .attach("file", filePath);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toMatch(/uploaded/i);

    // cleanup
    fs.unlinkSync(filePath);
  });

test("❌ Should fail upload without token", async () => {
  const filePath = path.join(process.cwd(), "tests", "testFile.txt");
  const fs = await import("fs");
  fs.writeFileSync(filePath, "Unauthorized upload");

  const res = await request(app)
    .post("/api/files/upload")
    .attach("file", filePath); // still attach a file

  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty("error");

  fs.unlinkSync(filePath);
});

});

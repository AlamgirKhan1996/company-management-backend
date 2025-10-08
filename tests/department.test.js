import request from "supertest";
import app from "../src/server.js";
import "./setup.js";

describe("Department API", () => {
  let token;

  beforeAll(async () => {
    // Register + login admin to get JWT
    await request(app).post("/api/auth/register").send({
      name: "Admin",
      email: "admin@company.com",
      password: "Admin123!",
      role: "ADMIN",
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "admin@company.com",
      password: "Admin123!",
    });
    token = loginRes.body.token;
  });

  it("should create a new department", async () => {
    const res = await request(app)
      .post("/api/departments")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Engineering" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Engineering");
  });

  it("should fetch all departments", async () => {
    const res = await request(app)
      .get("/api/departments")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

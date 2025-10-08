import request from "supertest";
import app from "../src/server.js";
import "./setup.js";

describe("ActivityLog API", () => {
  let token;

  beforeAll(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Admin",
      email: "admin@company.com",
      password: "Admin123!",
      role: "ADMIN",
    });

    const login = await request(app).post("/api/auth/login").send({
      email: "admin@company.com",
      password: "Admin123!",
    });
    token = login.body.token;
  });

  it("should get all activity logs", async () => {
    const res = await request(app)
      .get("/api/activity-logs")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

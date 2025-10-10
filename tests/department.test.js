import request from "supertest";
import app from "../src/server.js";
import "./setup.js";

describe("Department API", () => {
  let token;
  let createdDeptId;

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
    createdDeptId = res.body.id;
  });

  it("should fetch all departments", async () => {
    const res = await request(app)
      .get("/api/departments")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  
  it("should update a department", async () => {
    const res = await request(app)
      .put(`/api/departments/${createdDeptId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Engineering" });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Updated Engineering");
  });

  it("should delete a department", async () => {
    const res = await request(app)
      .delete(`/api/departments/${createdDeptId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  // // ❌ FAILURE CASES (Professional tests)
  // it("should fail to create department without name", async () => {
  //   const res = await request(app)
  //     .post("/api/departments")
  //     .set("Authorization", `Bearer ${token}`)
  //     .send({}); // Missing name

  //   expect(res.statusCode).toBeGreaterThanOrEqual(400);
  // });

  // it("should fail to fetch departments without token", async () => {
  //   const res = await request(app).get("/api/departments");
  //   expect(res.statusCode).toBe(401);
  // });

  // it("should fail to update non-existing department", async () => {
  //   const res = await request(app)
  //     .put("/api/departments/non-existing-id")
  //     .set("Authorization", `Bearer ${token}`)
  //     .send({ name: "DoesNotExist" });

  //   expect(res.statusCode).toBe(404);
  // });

  // it("should fail to delete non-existing department", async () => {
  //   const res = await request(app)
  //     .delete("/api/departments/fake-id")
  //     .set("Authorization", `Bearer ${token}`);

  //   expect(res.statusCode).toBe(404);
  // });
  
});

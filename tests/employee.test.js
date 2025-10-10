import request from "supertest";
import app from "../src/server.js";
import "./setup.js";

describe("Employee API", () => {
  let token, departmentId;
  let createdDeptId;

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

    const deptRes = await request(app)
      .post("/api/departments")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "HR" });
    departmentId = deptRes.body.id;
  });

  it("should create a new employee", async () => {
    const res = await request(app)
      .post("/api/employees")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "John alDoe",
        email: "john@company.com",
        departmentId,
        role: "EMPLOYEE",
        salary: 60000,
      });
      console.log("Employee creation response:", res.body);
      createdDeptId = res.body.employee.id;

    expect(res.statusCode).toBe(201);
    expect(res.body.employee.name).toBe("John alDoe");
  });

  it("should get all employees", async () => {
    const res = await request(app)
      .get("/api/employees")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it("should update all employees", async () => {
    const res = await request(app)
      .put(`/api/employees/${createdDeptId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "John Doe",
        email: "john@company.com",
        position: "Developer",
        departmentId,
      });

    expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("id");
  expect(res.body.position).toBe("Developer");

  });

  it("should delete an employee", async () => {
    const res = await request(app)
      .delete(`/api/employees/${createdDeptId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
});

import request from "supertest";
import app from "../src/app.js"; // make sure app exports express instance

describe("Project API", () => {
  it("should return 401 if not authenticated", async () => {
    const res = await request(app).post("/api/projects").send({
      name: "Unauthorized Test Project",
    });

    expect(res.statusCode).toBe(401);
  });
});

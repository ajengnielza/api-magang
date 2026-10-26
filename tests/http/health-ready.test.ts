
import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/database.config";

// Simulasikan database tidak dapat diakses.
jest.spyOn(AppDataSource, "query").mockRejectedValue(
  new Error("Database tidak dapat dijangkau")
);

describe("Health endpoint", () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("GET /api/v1/health tetap 200", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("GET /api/v1/health/ready menghasilkan 503 saat query gagal", async () => {
    const response = await request(app).get("/api/v1/health/ready");

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      status: "not_ready",
      database: "down",
    });
  });
});

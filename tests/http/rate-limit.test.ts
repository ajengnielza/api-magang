import request from "supertest";
import app from "../../src/app";
import { authService } from "../../src/services";
import { UnauthorizedError } from "../../src/utils/AppError";

jest.mock("../../src/services", () => ({
  pesertaService: {},
  jurnalService: {},
  authService: { login: jest.fn() },
}));

describe("rate limit login", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "development"; // menyalakan limiter
  });
  afterAll(() => {
    process.env.NODE_ENV = "test";
  });

  it("percobaan ke-11 menghasilkan 429 RATE_LIMITED dengan format error standar", async () => {
    jest.mocked(authService.login).mockRejectedValue(new UnauthorizedError("Email atau password salah"));
    const body = { email: "dewi@test.com", password: "salah" };

    for (let i = 1; i <= 10; i++) {
      const res = await request(app).post("/api/v1/auth/login").send(body);
      expect(res.status).toBe(401);
    }

    const res = await request(app).post("/api/v1/auth/login").send(body);

    expect(res.status).toBe(429);
    expect(res.body.sukses).toBe(false);
    expect(res.body.error.kode).toBe("RATE_LIMITED");
    expect(res.body.requestId).toBeDefined();
  });
});
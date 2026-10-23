import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { QueryFailedError } from "typeorm";
import { errorHandler } from "../../../src/middlewares/error.middleware";
import { NotFoundError } from "../../../src/utils/AppError";

// isProd dibaca setiap kali errorHandler dipanggil, jadi bisa diubah per test
let mockProduksi = false;
jest.mock("../../../src/config/env.config", () => ({
  get isProd() {
    return mockProduksi;
  },
}));

function buatRes() {
  const res = { headersSent: false, status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const req = { requestId: "req-1", method: "GET", originalUrl: "/x" } as never;

function pgError(kode: string): QueryFailedError {
  const asli = Object.assign(new Error("Key (email)=(a@b.c) already exists"), { code: kode });
  return new QueryFailedError("INSERT ...", [], asli);
}

describe("errorHandler: terjemahan error", () => {
  beforeEach(() => {
    mockProduksi = false;
  });

  it.each<[string, number, string, unknown]>([
    ["unique violation (23505)", 409, "CONFLICT", pgError("23505")],
    ["foreign key violation (23503)", 409, "CONFLICT", pgError("23503")],
    ["format nilai salah (22P02)", 400, "VALIDATION_ERROR", pgError("22P02")],
    ["kode PostgreSQL lain", 500, "INTERNAL_ERROR", pgError("99999")],
    ["token kedaluwarsa", 401, "TOKEN_EXPIRED", new TokenExpiredError("jwt expired", new Date())],
    ["token rusak", 401, "INVALID_TOKEN", new JsonWebTokenError("jwt malformed")],
    ["body terlalu besar", 413, "PAYLOAD_TOO_LARGE", Object.assign(new Error("besar"), { type: "entity.too.large" })],
    ["JSON rusak", 400, "INVALID_JSON", Object.assign(new SyntaxError("x"), { type: "entity.parse.failed" })],
    ["error tak dikenal", 500, "INTERNAL_ERROR", new Error("meledak")],
    ["AppError dibiarkan apa adanya", 404, "NOT_FOUND", new NotFoundError("Peserta")],
  ])("menerjemahkan %s menjadi %i %s", (_judul, status, kode, err) => {
    const res = buatRes();

    errorHandler(err, req, res as never, jest.fn());

    expect(res.status).toHaveBeenCalledWith(status);
    const body = res.json.mock.calls[0][0];
    expect(body.error.kode).toBe(kode);
    expect(body.requestId).toBe("req-1");
  });

  it("jika header sudah terkirim, error diteruskan ke handler bawaan Express", () => {
    const res = { ...buatRes(), headersSent: true };
    const next = jest.fn();
    const err = new Error("terlambat");

    errorHandler(err, req, res as never, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("errorHandler: mode production", () => {
  it("tidak membawa debug dan tidak membocorkan isi pesan database", () => {
    mockProduksi = true;
    const res = buatRes();

    errorHandler(pgError("23505"), req, res as never, jest.fn());

    const body = res.json.mock.calls[0][0];
    expect(body.error).not.toHaveProperty("debug");
    expect(JSON.stringify(body)).not.toContain("a@b.c");
  });
});
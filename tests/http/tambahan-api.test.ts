import request from "supertest";
import app from "../../src/app";
import { authService, jurnalService, pesertaService } from "../../src/services";
import {
  ConflictError, ForbiddenError, NotFoundError, UnauthorizedError,
} from "../../src/utils/AppError";
import { resetMockObjek } from "../helpers/resetMock";
import { bearer, tokenMentor, tokenPeserta } from "../helpers/token";

jest.mock("../../src/services", () => ({
  pesertaService: {
    getById: jest.fn(), getJurnalMilikPeserta: jest.fn(), getProfilSaya: jest.fn(),
    daftarPeserta: jest.fn(), ubahProfil: jest.fn(), delete: jest.fn(),
  },
  jurnalService: {
    getJurnalSaya: jest.fn(), getById: jest.fn(), create: jest.fn(), update: jest.fn(),
    updateStatusReview: jest.fn(), delete: jest.fn(), daftarJurnal: jest.fn(),
  },
  authService: { register: jest.fn(), login: jest.fn(), refresh: jest.fn(), logout: jest.fn() },
}));

beforeEach(() => resetMockObjek(pesertaService, jurnalService, authService));

const dasarRegister = {
  nama: "Budi Santoso",
  sekolah: "SMK 5 Malang",
  email: "budi@mail.com",
  password: "rahasia123",
  konfirmasiPassword: "rahasia123",
};

describe("POST /auth/register", () => {
  it("(a) 201 + Location, tanpa password, dan email dinormalkan sebelum sampai service", async () => {
    jest.mocked(authService.register).mockResolvedValue({
      id: 7, nama: "Budi Santoso", sekolah: "SMK 5 Malang", email: "budi@mail.com",
      role: "peserta", password: "HASH_RAHASIA",
    } as never);

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...dasarRegister, email: "  Budi@Mail.COM  " });

    expect(res.status).toBe(201);
    expect(res.headers.location).toBe("/api/v1/peserta/7");
    expect(JSON.stringify(res.body)).not.toContain("HASH_RAHASIA");
    expect(authService.register).toHaveBeenCalledWith(
      expect.objectContaining({ email: "budi@mail.com" })
    );
  });

  it("(b) 409 CONFLICT jika service melaporkan email duplikat", async () => {
    jest.mocked(authService.register).mockRejectedValue(new ConflictError("Email sudah terdaftar"));

    const res = await request(app).post("/api/v1/auth/register").send(dasarRegister);

    expect(res.status).toBe(409);
    expect(res.body.error.kode).toBe("CONFLICT");
    expect(res.body.error.pesan).toBe("Email sudah terdaftar");
  });

  it("422 dan service tidak dipanggil jika Content-Type bukan JSON (body dianggap kosong)", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .set("Content-Type", "text/plain")
      .send(JSON.stringify(dasarRegister));

    expect(res.status).toBe(422);
    expect(authService.register).not.toHaveBeenCalled();
  });
});

describe("POST /auth/login", () => {
  it("(c) 401 UNAUTHORIZED jika service menolak kredensial", async () => {
    jest.mocked(authService.login).mockRejectedValue(new UnauthorizedError("Email atau password salah"));

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "dewi@test.com", password: "salah" });

    expect(res.status).toBe(401);
    expect(res.body.error.kode).toBe("UNAUTHORIZED");
    expect(res.body.error.pesan).toBe("Email atau password salah");
  });

  it("200 mengembalikan token, dan data peserta tanpa password walau service membocorkannya", async () => {
    jest.mocked(authService.login).mockResolvedValue({
      accessToken: "ACCESS_X",
      refreshToken: "REFRESH_X",
      peserta: { id: 1, nama: "Dewi", email: "dewi@test.com", role: "peserta", password: "HASH_RAHASIA" },
    } as never);

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "dewi@test.com", password: "passwordAman123" });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBe("ACCESS_X");
    expect(JSON.stringify(res.body)).not.toContain("HASH_RAHASIA");
  });
});

describe("POST /auth/refresh dan /auth/logout", () => {
  it("refresh: 200 dan service menerima refreshToken dari body", async () => {
    jest.mocked(authService.refresh).mockResolvedValue({ accessToken: "BARU" } as never);

    const res = await request(app).post("/api/v1/auth/refresh").send({ refreshToken: "REFRESH_X" });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBe("BARU");
    expect(authService.refresh).toHaveBeenCalledWith("REFRESH_X");
  });

  it("refresh: 422 tanpa body sama sekali, service tidak dipanggil", async () => {
    const res = await request(app).post("/api/v1/auth/refresh");

    expect(res.status).toBe(422);
    expect(res.body.error.detail[0].field).toBe("refreshToken");
    expect(authService.refresh).not.toHaveBeenCalled();
  });

  it("logout: 200 dan token yang benar diteruskan ke service", async () => {
    jest.mocked(authService.logout).mockResolvedValue(undefined as never);

    const res = await request(app).post("/api/v1/auth/logout").send({ refreshToken: "REFRESH_X" });

    expect(res.status).toBe(200);
    expect(authService.logout).toHaveBeenCalledWith("REFRESH_X");
  });

  it("logout: 422 jika refreshToken bukan teks", async () => {
    const res = await request(app).post("/api/v1/auth/logout").send({ refreshToken: 123 });

    expect(res.status).toBe(422);
    expect(authService.logout).not.toHaveBeenCalled();
  });
});

describe("endpoint /me memakai identitas dari token", () => {
  it("GET /me memakai id dari token dan tidak membocorkan password", async () => {
    jest.mocked(pesertaService.getProfilSaya).mockResolvedValue({
      id: 5, nama: "Dewi", password: "HASH_RAHASIA",
    } as never);

    const res = await request(app).get("/api/v1/me").set("Authorization", bearer(tokenPeserta(5)));

    expect(res.status).toBe(200);
    expect(pesertaService.getProfilSaya).toHaveBeenCalledWith(5);
    expect(res.body.data).not.toHaveProperty("password");
  });

  it("GET /me/jurnal memakai id dari token", async () => {
    jest.mocked(jurnalService.getJurnalSaya).mockResolvedValue([] as never);

    const res = await request(app).get("/api/v1/me/jurnal").set("Authorization", bearer(tokenPeserta(5)));

    expect(res.status).toBe(200);
    expect(jurnalService.getJurnalSaya).toHaveBeenCalledWith(5);
  });

  it("PATCH /me 200 dan hanya field sah yang diteruskan", async () => {
    jest.mocked(pesertaService.ubahProfil).mockResolvedValue({ id: 5, nama: "Dewi Lestari" } as never);

    const res = await request(app)
      .patch("/api/v1/me")
      .set("Authorization", bearer(tokenPeserta(5)))
      .send({ nama: "  Dewi Lestari  " });

    expect(res.status).toBe(200);
    expect(pesertaService.ubahProfil).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ nama: "Dewi Lestari" })
    );
  });
});

describe("endpoint peserta", () => {
  it("(d) GET /peserta meneruskan query yang sudah dibersihkan ke service", async () => {
    jest.mocked(pesertaService.daftarPeserta).mockResolvedValue({ data: [], total: 0 } as never);

    const res = await request(app).get("/api/v1/peserta").query({
      page: 2, limit: 5, q: "  budi  ", sortBy: "nama", order: "asc", sekolah: "SMK 5 Malang", fase: 1,
    });

    expect(res.status).toBe(200);
    expect(pesertaService.daftarPeserta).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 5, q: "budi", sortBy: "nama", order: "ASC" }),
      { sekolah: "SMK 5 Malang", fase: 1 }
    );
    expect(res.body.meta).toMatchObject({ page: 2, limit: 5 });
  });

  it("(e) GET /peserta?sortBy=password 422 dan service tidak dipanggil", async () => {
    const res = await request(app).get("/api/v1/peserta").query({ sortBy: "password" });

    expect(res.status).toBe(422);
    expect(res.body.error.detail.map((d: { field: string }) => d.field)).toContain("sortBy");
    expect(pesertaService.daftarPeserta).not.toHaveBeenCalled();
  });

  it("(f) DELETE /peserta/1 oleh mentor: 204 tanpa body", async () => {
    jest.mocked(pesertaService.delete).mockResolvedValue(undefined as never);

    const res = await request(app).delete("/api/v1/peserta/1").set("Authorization", bearer(tokenMentor()));

    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    expect(pesertaService.delete).toHaveBeenCalledWith(1);
  });

  it("(g) DELETE /peserta/99: NotFoundError dari service menjadi 404 dengan pesan yang benar", async () => {
    jest.mocked(pesertaService.delete).mockRejectedValue(new NotFoundError("Peserta dengan id 99"));

    const res = await request(app).delete("/api/v1/peserta/99").set("Authorization", bearer(tokenMentor()));

    expect(res.status).toBe(404);
    expect(res.body.error.kode).toBe("NOT_FOUND");
    expect(res.body.error.pesan).toBe("Peserta dengan id 99 tidak ditemukan");
  });

  it("DELETE /peserta/1 oleh peserta: 403 dan service tidak dipanggil", async () => {
    const res = await request(app).delete("/api/v1/peserta/1").set("Authorization", bearer(tokenPeserta()));

    expect(res.status).toBe(403);
    expect(pesertaService.delete).not.toHaveBeenCalled();
  });

  it("PATCH /peserta/2 oleh mentor: 200", async () => {
    jest.mocked(pesertaService.ubahProfil).mockResolvedValue({ id: 2, nama: "Nama Baru" } as never);

    const res = await request(app)
      .patch("/api/v1/peserta/2")
      .set("Authorization", bearer(tokenMentor()))
      .send({ nama: "Nama Baru" });

    expect(res.status).toBe(200);
    expect(pesertaService.ubahProfil).toHaveBeenCalledWith(2, expect.objectContaining({ nama: "Nama Baru" }));
  });

  it("PATCH /peserta/2 oleh peserta: 403", async () => {
    const res = await request(app)
      .patch("/api/v1/peserta/2")
      .set("Authorization", bearer(tokenPeserta()))
      .send({ nama: "Nama Baru" });

    expect(res.status).toBe(403);
    expect(pesertaService.ubahProfil).not.toHaveBeenCalled();
  });
});

describe("endpoint jurnal", () => {
  it("POST /jurnal 201: pesertaId dari token dan Location menunjuk jurnal baru", async () => {
    jest.mocked(jurnalService.create).mockResolvedValue({
      id: 12, pesertaId: 3, kegiatan: "Belajar supertest dengan mock service", statusReview: "belum",
    } as never);

    const res = await request(app)
      .post("/api/v1/jurnal")
      .set("Authorization", bearer(tokenPeserta(3)))
      .send({ kegiatan: "Belajar supertest dengan mock service" });

    expect(res.status).toBe(201);
    expect(res.headers.location).toBe("/api/v1/jurnal/12");
    expect(jurnalService.create).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ kegiatan: "Belajar supertest dengan mock service" })
    );
  });

  it("POST /jurnal dengan pesertaId di body: 422 dan service tidak dipanggil", async () => {
    const res = await request(app)
      .post("/api/v1/jurnal")
      .set("Authorization", bearer(tokenPeserta(3)))
      .send({ pesertaId: 99, kegiatan: "Mencoba menulis atas nama orang lain" });

    expect(res.status).toBe(422);
    expect(jurnalService.create).not.toHaveBeenCalled();
  });

  it("PATCH /jurnal/1: ForbiddenError dari service menjadi 403, identitas dari token", async () => {
    jest.mocked(jurnalService.update).mockRejectedValue(new ForbiddenError("Kamu tidak berhak mengubah jurnal ini"));

    const res = await request(app)
      .patch("/api/v1/jurnal/1")
      .set("Authorization", bearer(tokenPeserta(2)))
      .send({ hambatan: "Belum paham" });

    expect(res.status).toBe(403);
    expect(res.body.error.kode).toBe("FORBIDDEN");
    expect(jurnalService.update).toHaveBeenCalledWith(
      1, expect.objectContaining({ hambatan: "Belum paham" }), 2, "peserta"
    );
  });

  it("DELETE /jurnal/1: 204, dan id serta peran pengguna diambil dari token", async () => {
    jest.mocked(jurnalService.delete).mockResolvedValue(undefined as never);

    const res = await request(app).delete("/api/v1/jurnal/1").set("Authorization", bearer(tokenPeserta(1)));

    expect(res.status).toBe(204);
    expect(jurnalService.delete).toHaveBeenCalledWith(1, 1, "peserta");
  });
});

describe("PATCH /jurnal/:id/review", () => {
  const review = { statusReview: "revisi", catatan: "Tolong perjelas bagian hambatan" };

  it("(h) 403 untuk peserta, bahkan sebelum body diperiksa", async () => {
    const res = await request(app)
      .patch("/api/v1/jurnal/1/review")
      .set("Authorization", bearer(tokenPeserta()))
      .send({});

    expect(res.status).toBe(403);
    expect(jurnalService.updateStatusReview).not.toHaveBeenCalled();
  });

  it("(h) 422 untuk mentor jika disetujui tanpa catatan", async () => {
    const res = await request(app)
      .patch("/api/v1/jurnal/1/review")
      .set("Authorization", bearer(tokenMentor()))
      .send({ statusReview: "disetujui" });

    expect(res.status).toBe(422);
    expect(res.body.error.detail.map((d: { field: string }) => d.field)).toContain("catatan");
  });

  it("422 untuk status lama 'sudah' yang tidak dikenal lagi", async () => {
    const res = await request(app)
      .patch("/api/v1/jurnal/1/review")
      .set("Authorization", bearer(tokenMentor()))
      .send({ statusReview: "sudah", catatan: "Sudah bagus" });

    expect(res.status).toBe(422);
    expect(res.body.error.detail.map((d: { field: string }) => d.field)).toContain("statusReview");
  });

  it("200 untuk mentor, dan reviewerId diambil dari token mentor", async () => {
    jest.mocked(jurnalService.updateStatusReview).mockResolvedValue({ id: 1, statusReview: "revisi" } as never);

    const res = await request(app)
      .patch("/api/v1/jurnal/1/review")
      .set("Authorization", bearer(tokenMentor(99)))
      .send(review);

    expect(res.status).toBe(200);
    expect(jurnalService.updateStatusReview).toHaveBeenCalledWith(
      1, expect.objectContaining(review), 99
    );
  });
});

describe("(i) health dan (j) X-Request-Id", () => {
  it("GET /health 200", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it.each<["get" | "post", string, number]>([
    ["get", "/api/v1/health", 200],
    ["get", "/api/v1/me", 401],
    ["get", "/api/v1/tidak-ada", 404],
    ["post", "/api/v1/auth/register", 422],
  ])("%s %s selalu membawa X-Request-Id (status %i)", async (method, path, status) => {
    const res = await request(app)[method](path);

    expect(res.status).toBe(status);
    expect(res.headers["x-request-id"]).toBeDefined();
    if (status >= 400) expect(res.body.requestId).toBe(res.headers["x-request-id"]);
  });
});
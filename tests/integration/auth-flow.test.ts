
import "reflect-metadata";
import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/database.config";
import { Peserta } from "../../src/entities/Peserta.entity";
import {
  bersihkanDatabase,
  siapkanDatabase,
  tutupDatabase,
} from "../helpers/db";

describe("Alur autentikasi lengkap (database sungguhan)", () => {
  const akun = {
    nama: "Budi Santoso",
    sekolah: "SMK 5 Malang",
    email: "budi@mail.com",
    password: "rahasia123",
    konfirmasiPassword: "rahasia123",
  };

  beforeAll(siapkanDatabase);
  beforeEach(bersihkanDatabase);
  afterAll(tutupDatabase);

  it("register, login, akses /me, tolak mass assignment, refresh, logout, refresh ditolak", async () => {
    // Agent menyimpan cookie dari respons dan mengirimkannya otomatis.
    const agent = request.agent(app);

    // 1. Register
    const reg = await agent
      .post("/api/v1/auth/register")
      .send(akun);

    expect(reg.status).toBe(201);
    expect(reg.body.data).not.toHaveProperty("password");

    // 2. Login
    const login = await agent
      .post("/api/v1/auth/login")
      .send({ email: akun.email, password: akun.password });

    expect(login.status).toBe(200);

    const { accessToken } = login.body.data;

    expect(accessToken).toEqual(expect.any(String));
    expect(login.body.data).not.toHaveProperty("refreshToken");
    expect(login.headers["set-cookie"]).toBeDefined();

    // 3. Akses profil sendiri
    const me = await agent
      .get("/api/v1/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(akun.email);
    expect(me.body.data).not.toHaveProperty("password");

    // 4. Mass assignment ditolak dan role database tidak berubah
    const nakal = await agent
      .patch("/api/v1/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ role: "mentor" });

    expect(nakal.status).toBe(422);

    const dariDb = await AppDataSource
      .getRepository(Peserta)
      .findOneByOrFail({ email: akun.email });

    expect(dariDb.role).toBe("peserta");

    // 5. Refresh menggunakan cookie
    const refresh = await agent
      .post("/api/v1/auth/refresh");

    expect(refresh.status).toBe(200);
    expect(refresh.body.data.accessToken).toEqual(expect.any(String));

    // 6. Logout
    const logout = await agent
      .post("/api/v1/auth/logout");

    expect(logout.status).toBe(204);

    // 7. Refresh setelah logout harus ditolak
    const refreshLagi = await agent
      .post("/api/v1/auth/refresh");

    expect(refreshLagi.status).toBe(401);
  });

  it("menolak email duplikat walau beda huruf besar dan spasi (409)", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send(akun);

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...akun, email: "  BUDI@mail.com " });

    expect(res.status).toBe(409);
    expect(res.body.error.kode).toBe("CONFLICT");
  });

  it("dua register bersamaan dengan email sama: satu 201, satu 409 (UNIQUE constraint)", async () => {
    const [a, b] = await Promise.all([
      request(app).post("/api/v1/auth/register").send(akun),
      request(app).post("/api/v1/auth/register").send(akun),
    ]);

    expect([a.status, b.status].sort()).toEqual([201, 409]);
  });
});

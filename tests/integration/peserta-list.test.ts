import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/database.config";
import { Peserta } from "../../src/entities/Peserta.entity";
import { bersihkanDatabase, siapkanDatabase, tutupDatabase } from "../helpers/db";

describe("GET /peserta di database sungguhan (15 data)", () => {
  beforeAll(siapkanDatabase);
  afterAll(tutupDatabase);

  // Data: Peserta 01..15, email p1..p15@mail.com
  //   sekolah "SMK Negeri 1": i = 0,3,6,9,12  (semuanya fase 1)
  //   sekolah "SMK Negeri 2": sisanya (fase 2 atau 3)
  beforeEach(async () => {
    await bersihkanDatabase();
    const repo = AppDataSource.getRepository(Peserta);
    await repo.save(
      Array.from({ length: 15 }, (_, i) =>
        repo.create({
          nama: `Peserta ${String(i + 1).padStart(2, "0")}`,
          sekolah: i % 3 === 0 ? "SMK Negeri 1" : "SMK Negeri 2",
          email: `p${i + 1}@mail.com`,
          password: "HASH_TIDAK_DIPAKAI",
          role: "peserta",
          fase: (i % 3) + 1,
        })
      )
    );
  });

  const ambil = (query: Record<string, string | number>) =>
    request(app).get("/api/v1/peserta").query(query);

  describe("pagination", () => {
    it("halaman 1: 10 data dan ada halaman berikutnya", async () => {
      const res = await ambil({ page: 1, limit: 10, sortBy: "nama", order: "asc" });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(10);
      expect(res.body.data[0].nama).toBe("Peserta 01");
      expect(res.body.meta).toEqual({
        page: 1, limit: 10, total: 15, totalPages: 2, hasNext: true, hasPrev: false,
      });
    });

    it("halaman 2: sisa 5 data", async () => {
      const res = await ambil({ page: 2, limit: 10, sortBy: "nama", order: "asc" });

      expect(res.body.data).toHaveLength(5);
      expect(res.body.data[4].nama).toBe("Peserta 15");
      expect(res.body.meta).toMatchObject({ hasNext: false, hasPrev: true });
    });

    it("halaman di luar batas: 200 dengan data kosong, total tetap benar", async () => {
      const res = await ambil({ page: 3, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta).toMatchObject({ total: 15, totalPages: 2 });
    });

    it("order desc membalik urutan", async () => {
      const res = await ambil({ sortBy: "nama", order: "desc", limit: 3 });

      expect(res.body.data.map((p: { nama: string }) => p.nama)).toEqual([
        "Peserta 15", "Peserta 14", "Peserta 13",
      ]);
    });
  });

  describe("filter", () => {
    it("filter sekolah", async () => {
      const res = await ambil({ sekolah: "SMK Negeri 1" });

      expect(res.body.meta.total).toBe(5);
      expect(res.body.data.every((p: { sekolah: string }) => p.sekolah === "SMK Negeri 1")).toBe(true);
    });

    it("filter fase", async () => {
      const res = await ambil({ fase: 2 });

      expect(res.body.meta.total).toBe(5);
    });

    it("sekolah dan fase digabung sebagai AND", async () => {
      expect((await ambil({ sekolah: "SMK Negeri 1", fase: 1 })).body.meta.total).toBe(5);
      expect((await ambil({ sekolah: "SMK Negeri 1", fase: 2 })).body.meta.total).toBe(0);
    });
  });

  describe("pencarian q", () => {
    it("cocok pada nama", async () => {
      const res = await ambil({ q: "Peserta 07" });

      expect(res.body.meta.total).toBe(1);
      expect(res.body.data[0].email).toBe("p7@mail.com");
    });

    it("cocok pada email (nama ATAU email)", async () => {
      const res = await ambil({ q: "p12@mail" });

      expect(res.body.meta.total).toBe(1);
      expect(res.body.data[0].nama).toBe("Peserta 12");
    });

    it("tidak peka huruf besar-kecil", async () => {
      expect((await ambil({ q: "PESERTA 07" })).body.meta.total).toBe(1);
    });

    it.each<[string, string]>([
      ["cocok lewat nama", "Peserta 01"],
      ["cocok lewat email", "p1@mail"],
    ])("filter sekolah tetap berlaku pada kedua cabang OR (%s)", async (_judul, q) => {
      // Peserta 01 bersekolah di SMK Negeri 1, jadi filter SMK Negeri 2 harus menghasilkan 0
      const res = await ambil({ q, sekolah: "SMK Negeri 2" });

      expect(res.body.meta.total).toBe(0);
    });

    it.each(["%", "_"])("karakter '%s' diperlakukan sebagai teks biasa, bukan wildcard", async (q) => {
      const res = await ambil({ q });

      expect(res.status).toBe(200);
      expect(res.body.meta.total).toBe(0);
    });
  });

  it("password tidak pernah ikut keluar", async () => {
    const res = await ambil({ limit: 100 });

    expect(JSON.stringify(res.body)).not.toContain("HASH_TIDAK_DIPAKAI");
    expect(res.body.data[0]).not.toHaveProperty("password");
  });
});
import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/database.config";
import { JurnalHarian } from "../../src/entities/Jurnal.entity";
import { Peserta } from "../../src/entities/Peserta.entity";
import {
  bersihkanDatabase, buatAkun, buatJurnal, siapkanDatabase, tutupDatabase,
} from "../helpers/db";
import { bearer, tokenMentor } from "../helpers/token";

describe("DELETE /peserta/:id (constraint database sungguhan)", () => {
  beforeAll(siapkanDatabase);
  beforeEach(bersihkanDatabase);
  afterAll(tutupDatabase);

  const hapus = (id: number) =>
    request(app).delete(`/api/v1/peserta/${id}`).set("Authorization", bearer(tokenMentor()));

  it("409 jika peserta masih punya jurnal, lalu 204 dan 404 setelah jurnalnya dihapus", async () => {
    const peserta = await buatAkun("p1@mail.com");
    const jurnal = await buatJurnal(peserta.id);

    const gagal = await hapus(peserta.id);
    expect(gagal.status).toBe(409);
    expect(gagal.body.error.kode).toBe("CONFLICT");
    // pesan untuk klien tidak boleh membocorkan nama tabel atau constraint
    expect(gagal.body.error.pesan).not.toMatch(/jurnal_harian|FK_|peserta_id/);
    expect(await AppDataSource.getRepository(Peserta).countBy({ id: peserta.id })).toBe(1);

    await AppDataSource.getRepository(JurnalHarian).delete({ id: jurnal.id });

    expect((await hapus(peserta.id)).status).toBe(204);
    expect((await hapus(peserta.id)).status).toBe(404);
  });

  it("peserta yang pernah login tetap bisa dihapus mentor (refresh token ikut terhapus)", async () => {
    const akun = {
      nama: "Budi Santoso", sekolah: "SMK 5 Malang", email: "budi@mail.com",
      password: "rahasia123", konfirmasiPassword: "rahasia123",
    };
    await request(app).post("/api/v1/auth/register").send(akun);
    await request(app).post("/api/v1/auth/login").send({ email: akun.email, password: akun.password });
    const peserta = await AppDataSource.getRepository(Peserta).findOneByOrFail({ email: akun.email });

    const res = await hapus(peserta.id);

    expect(res.status).toBe(204);
  });
});
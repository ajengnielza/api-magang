import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/database.config";
import { JurnalHarian } from "../../src/entities/Jurnal.entity";
import { Peserta } from "../../src/entities/Peserta.entity";
import {
  bersihkanDatabase, buatAkun, buatJurnal, siapkanDatabase, tutupDatabase,
} from "../helpers/db";
import { bearer, tokenMentor, tokenPeserta } from "../helpers/token";

describe("Alur jurnal dan review (database sungguhan)", () => {
  let pemilik: Peserta;
  let lain: Peserta;
  let mentor: Peserta;
  const repoJurnal = () => AppDataSource.getRepository(JurnalHarian);

  beforeAll(siapkanDatabase);
  afterAll(tutupDatabase);
  beforeEach(async () => {
    await bersihkanDatabase();
    pemilik = await buatAkun("pemilik@mail.com");
    lain = await buatAkun("lain@mail.com");
    mentor = await buatAkun("mentor@mail.com", "mentor");
  });

  it("peserta membuat jurnal atas namanya sendiri dan melihatnya di /me/jurnal", async () => {
    const buat = await request(app)
      .post("/api/v1/jurnal")
      .set("Authorization", bearer(tokenPeserta(pemilik.id)))
      .send({ kegiatan: "Belajar integration test dengan PostgreSQL", hambatan: "Awalnya bingung migration" });

    expect(buat.status).toBe(201);
    expect(buat.headers.location).toBe(`/api/v1/jurnal/${buat.body.data.id}`);

    const dariDb = await repoJurnal().findOneByOrFail({ id: buat.body.data.id });
    expect(dariDb.pesertaId).toBe(pemilik.id);
    expect(dariDb.statusReview).toBe("belum");

    const saya = await request(app)
      .get("/api/v1/me/jurnal")
      .set("Authorization", bearer(tokenPeserta(pemilik.id)));
    expect(saya.body.data).toHaveLength(1);
  });

  it("peserta lain ditolak 403 saat mengubah dan data tidak berubah; pemilik boleh", async () => {
    const jurnal = await buatJurnal(pemilik.id);

    const tolak = await request(app)
      .patch(`/api/v1/jurnal/${jurnal.id}`)
      .set("Authorization", bearer(tokenPeserta(lain.id)))
      .send({ hambatan: "Disusupi" });
    expect(tolak.status).toBe(403);
    expect((await repoJurnal().findOneByOrFail({ id: jurnal.id })).hambatan).toBeNull();

    const ok = await request(app)
      .patch(`/api/v1/jurnal/${jurnal.id}`)
      .set("Authorization", bearer(tokenPeserta(pemilik.id)))
      .send({ hambatan: "Butuh waktu memahami relasi" });
    expect(ok.status).toBe(200);
    expect((await repoJurnal().findOneByOrFail({ id: jurnal.id })).hambatan).toBe("Butuh waktu memahami relasi");
  });

  it("peserta lain tidak bisa menghapus jurnal orang, pemilik bisa (204)", async () => {
    const jurnal = await buatJurnal(pemilik.id);

    const tolak = await request(app)
      .delete(`/api/v1/jurnal/${jurnal.id}`)
      .set("Authorization", bearer(tokenPeserta(lain.id)));
    expect(tolak.status).toBe(403);
    expect(await repoJurnal().countBy({ id: jurnal.id })).toBe(1);

    const ok = await request(app)
      .delete(`/api/v1/jurnal/${jurnal.id}`)
      .set("Authorization", bearer(tokenPeserta(pemilik.id)));
    expect(ok.status).toBe(204);
    expect(await repoJurnal().countBy({ id: jurnal.id })).toBe(0);
  });

  it("mentor me-review jurnal: status, catatan, dan reviewerId tersimpan", async () => {
    const jurnal = await buatJurnal(pemilik.id);

    const res = await request(app)
      .patch(`/api/v1/jurnal/${jurnal.id}/review`)
      .set("Authorization", bearer(tokenMentor(mentor.id)))
      .send({ statusReview: "disetujui", catatan: "Sudah bagus sekali" });

    expect(res.status).toBe(200);
    const dariDb = await repoJurnal().findOneByOrFail({ id: jurnal.id });
    expect(dariDb.statusReview).toBe("disetujui");
    expect(dariDb.catatanMentor).toBe("Sudah bagus sekali");
    expect(dariDb.reviewerId).toBe(mentor.id);
  });

  describe("daftar jurnal oleh mentor", () => {
    beforeEach(async () => {
      await buatJurnal(pemilik.id, "belum");
      await buatJurnal(pemilik.id, "disetujui");
      await buatJurnal(lain.id, "belum");
    });

    const ambil = (query: Record<string, string | number>) =>
      request(app).get("/api/v1/jurnal").query(query).set("Authorization", bearer(tokenMentor(mentor.id)));

    it.each<[string, Record<string, string>, number]>([
      ["tanpa filter", {}, 3],
      ["statusReview=disetujui", { statusReview: "disetujui" }, 1],
      ["belumDireview=true", { belumDireview: "true" }, 2],
      ["belumDireview=false", { belumDireview: "false" }, 1],
      ["rentang tanggal mencakup hari ini", { from: "2000-01-01", to: "2100-01-01" }, 3],
      ["rentang tanggal di masa lalu", { to: "2000-01-01" }, 0],
    ])("filter %s", async (_judul, query, total) => {
      const res = await ambil(query);

      expect(res.status).toBe(200);
      expect(res.body.meta.total).toBe(total);
    });

    it("filter pesertaId", async () => {
      expect((await ambil({ pesertaId: pemilik.id })).body.meta.total).toBe(2);
    });
  });
});
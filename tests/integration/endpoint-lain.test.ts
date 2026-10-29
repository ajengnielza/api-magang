import request from "supertest";
import app from "../../src/app";
import {
  bersihkanDatabase,
  buatAkun,
  buatJurnal,
  siapkanDatabase,
  tutupDatabase,
} from "../helpers/db";
import { bearer, tokenPeserta } from "../helpers/token";

describe("endpoint lain di database sungguhan", () => {
  beforeAll(siapkanDatabase);
  beforeEach(bersihkanDatabase);
  afterAll(tutupDatabase);

  it("GET /health/ready: 200 dan database up", async () => {
    const res = await request(app).get("/api/v1/health/ready");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "ready",
      database: "up",
    });
  });

  it("GET /peserta/:id/jurnal memuat jurnal lewat relasi", async () => {
    const p = await buatAkun("a@mail.com");
    await buatJurnal(p.id);
    await buatJurnal(p.id);

    const res = await request(app).get(`/api/v1/peserta/${p.id}/jurnal`);

    expect(res.status).toBe(200);
    expect(res.body.data.pesertaId).toBe(p.id);
    expect(res.body.data.jurnal).toHaveLength(2);
  });

  it("GET /peserta/:id/jurnal: 404 jika peserta tidak ada", async () => {
    const res = await request(app).get("/api/v1/peserta/9999/jurnal");

    expect(res.status).toBe(404);
  });

  it("GET /jurnal/:id mengembalikan jurnal, dan 404 jika tidak ada", async () => {
    const p = await buatAkun("a@mail.com");
    const j = await buatJurnal(p.id);
    const auth = bearer(tokenPeserta(p.id));

    const ada = await request(app)
      .get(`/api/v1/jurnal/${j.id}`)
      .set("Authorization", auth);

    expect(ada.status).toBe(200);
    expect(ada.body.data.id).toBe(j.id);

    const tidakAda = await request(app)
      .get("/api/v1/jurnal/9999")
      .set("Authorization", auth);

    expect(tidakAda.status).toBe(404);
  });

  it("GET /stats menghitung dari data nyata", async () => {
    const a = await buatAkun("a@mail.com");
    const b = await buatAkun("b@mail.com");
    await buatJurnal(a.id, "belum");
    await buatJurnal(a.id, "disetujui");
    await buatJurnal(b.id, "belum");

    const res = await request(app).get("/api/v1/stats");

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      totalPeserta: 2,
      totalJurnal: 3,
      jurnalBelumDireview: 2,
      rataRataJurnalPerPeserta: 1.5,
    });
  });

  it("GET /stats/per-peserta mengelompokkan jurnal per peserta (GROUP BY)", async () => {
    const a = await buatAkun("a@mail.com");
    const b = await buatAkun("b@mail.com");
    await buatJurnal(a.id);
    await buatJurnal(a.id);
    await buatJurnal(b.id);

    const res = await request(app).get("/api/v1/stats/per-peserta");

    expect(res.status).toBe(200);

    const hitung = Object.fromEntries(
      res.body.data.map(
        (r: { pesertaId: number; totalJurnal: string }) => [
          r.pesertaId,
          Number(r.totalJurnal),
        ],
      ),
    );

    expect(hitung).toEqual({
      [a.id]: 2,
      [b.id]: 1,
    });
  });
});
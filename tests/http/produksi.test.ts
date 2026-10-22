import type { Application } from "express";
import request from "supertest";
import { bearer, tokenMentor } from "../helpers/token";

jest.mock("../../src/services", () => ({
  pesertaService: {},
  authService: {},
  jurnalService: { daftarJurnal: jest.fn() },
}));

describe("mode production", () => {
  const envAsli = process.env.NODE_ENV;
  afterAll(() => {
    process.env.NODE_ENV = envAsli;
  });

  it("error 500 tidak membawa debug, stack, maupun pesan asli", async () => {
    process.env.NODE_ENV = "production";

    // isolateModules memuat ulang app dengan NODE_ENV=production
    // (isProd dihitung saat modul env.config dimuat)
    let app!: Application;
    let daftarJurnal!: jest.Mock;
    jest.isolateModules(() => {
      app = require("../../src/app").default;
      daftarJurnal = require("../../src/services").jurnalService.daftarJurnal;
    });
    daftarJurnal.mockRejectedValue(new Error("koneksi db putus: password=rahasia"));

    const res = await request(app).get("/api/v1/jurnal").set("Authorization", bearer(tokenMentor()));

    expect(res.status).toBe(500);
    expect(res.body.error).not.toHaveProperty("debug");
    expect(JSON.stringify(res.body)).not.toContain("rahasia");
  });
});
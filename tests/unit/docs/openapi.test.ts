import SwaggerParser from "@apidevtools/swagger-parser";
import { spec } from "../../../src/docs/swagger";

type Operasi = {
  tags?: string[];
  summary?: string;
  security?: unknown[];
  requestBody?: unknown;
  responses?: Record<string, unknown>;
};

type DokumenOpenAPI = {
  security?: unknown[];
  paths?: Record<string, Record<string, Operasi>>;
};

const dokumen = spec as DokumenOpenAPI;

const METODE = ["get", "post", "put", "patch", "delete"] as const;

const paths = dokumen.paths ?? {};

const semuaOperasi = (): [string, Operasi][] =>
  Object.entries(paths).flatMap(([path, item]) =>
    METODE.filter((metode) => item[metode] !== undefined).map(
      (metode): [string, Operasi] => [
        `${metode.toUpperCase()} ${path}`,
        item[metode],
      ]
    )
  );

describe("Dokumen OpenAPI", () => {
  it("valid menurut spesifikasi OpenAPI dan semua $ref terselesaikan", async () => {
    await expect(
      SwaggerParser.validate(structuredClone(spec) as never)
    ).resolves.toBeDefined();
  });

  it("memuat minimal satu endpoint", () => {
    expect(semuaOperasi().length).toBeGreaterThan(0);
  });

  it.each(semuaOperasi())(
    "%s memenuhi konvensi dokumentasi",
    (_nama, op) => {
      const kodeRespons = Object.keys(op.responses ?? {});

      const keamanan =
        op.security !== undefined ? op.security : dokumen.security;

      const publik = Array.isArray(keamanan) && keamanan.length === 0;

      expect(op.summary?.trim()).toBeTruthy();
      expect(op.tags?.length).toBeGreaterThan(0);

      expect(
        kodeRespons.some((kode) => /^2\d\d$/.test(kode))
      ).toBe(true);

      if (!publik) {
        expect(kodeRespons).toContain("401");
      }

      if (op.requestBody) {
        expect(kodeRespons).toContain("422");
      }
    }
  );
});
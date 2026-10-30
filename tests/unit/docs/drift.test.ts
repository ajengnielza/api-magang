
import fs from "fs";
import path from "path";

import { spec } from "../../../src/docs/swagger";
import {
  SORT_JURNAL,
  STATUS_REVIEW,
} from "../../../src/dto/jurnal.dto";
import { SORT_PESERTA } from "../../../src/dto/peserta.dto";

/* eslint-disable @typescript-eslint/no-explicit-any */

const schemas = (spec.components as any).schemas;
const paths = spec.paths as Record<string, any>;

const parameter = (pathEndpoint: string, nama: string) => {
  const operasi = paths[pathEndpoint]?.get;

  return (
    operasi?.parameters as
      | {
          name?: string;
          schema?: { enum?: string[] };
        }[]
      | undefined
  )?.find((p) => p.name === nama);
};

describe("Dokumen tidak menyimpang dari kode", () => {
  it("enum statusReview pada schema Jurnal sama dengan DTO", () => {
    expect(schemas.Jurnal.properties.statusReview.enum).toEqual([
      ...STATUS_REVIEW,
    ]);
  });

  it("enum statusReview pada filter GET /jurnal sama dengan DTO", () => {
    expect(
      parameter("/jurnal", "statusReview")?.schema?.enum
    ).toEqual([...STATUS_REVIEW]);
  });

  it("enum sortBy pada GET /peserta sama dengan SORT_PESERTA", () => {
    expect(
      parameter("/peserta", "sortBy")?.schema?.enum
    ).toEqual([...SORT_PESERTA]);
  });

  it("enum sortBy pada GET /jurnal sama dengan SORT_JURNAL", () => {
    expect(
      parameter("/jurnal", "sortBy")?.schema?.enum
    ).toEqual([...SORT_JURNAL]);
  });

  it("mencakup semua endpoint yang tercatat di endpoint-audit", () => {
    const seharusnya = [
      "POST /auth/register",
      "POST /auth/login",
      "POST /auth/refresh",
      "POST /auth/logout",

      "GET /me",
      "PATCH /me",
      "GET /me/jurnal",

      "GET /peserta",
      "GET /peserta/{id}",
      "GET /peserta/{id}/jurnal",
      "PATCH /peserta/{id}",
      "DELETE /peserta/{id}",

      "GET /jurnal",
      "POST /jurnal",
      "GET /jurnal/{id}",
      "PATCH /jurnal/{id}",
      "PATCH /jurnal/{id}/review",
      "DELETE /jurnal/{id}",

      "GET /stats",
      "GET /stats/per-peserta",

      "GET /health",
      "GET /health/ready",
    ];

    const terdokumentasi = Object.entries(paths).flatMap(
      ([pathEndpoint, item]) =>
        Object.keys(item)
          .filter((metode) =>
            ["get", "post", "put", "patch", "delete"].includes(metode)
          )
          .map(
            (metode) =>
              `${metode.toUpperCase()} ${pathEndpoint}`
          )
    );

    expect(
      seharusnya.filter(
        (endpoint) => !terdokumentasi.includes(endpoint)
      )
    ).toEqual([]);
  });
});

// Aktifkan setelah Langkah 2: dokumen sudah diekspor.
describe("Berkas ekspor", () => {
 it(
  "docs/openapi.json sama dengan dokumen saat ini (jalankan npm run docs:export jika gagal)",
    () => {
      const berkas = JSON.parse(
        fs.readFileSync(
          path.join(process.cwd(), "docs", "openapi.json"),
          "utf-8"
        )
      );

      expect(berkas).toEqual(
        JSON.parse(JSON.stringify(spec))
      );
    }
  );
});

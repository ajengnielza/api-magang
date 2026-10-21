import {
  CreateJurnalDto, ListJurnalQueryDto, ReviewJurnalDto, UpdateJurnalDto,
} from "../../../src/dto/jurnal.dto";
import { validasiDto } from "../../../src/utils/validasi.util";
import { fieldYangGagal } from "../../helpers/dto";

const lampiranOk = { url: "https://contoh.com/ss1.png", keterangan: "tangkapan layar" };

describe("CreateJurnalDto", () => {
  const dasar = { kegiatan: "Belajar unit testing dengan Jest" };

  it.each<[string, Record<string, unknown>]>([
    ["hanya kegiatan", {}],
    ["kegiatan tepat 10 karakter", { kegiatan: "1234567890" }],
    ["kegiatan tepat 2000 karakter", { kegiatan: "a".repeat(2000) }],
    ["dengan hambatan dan link commit", { hambatan: "Belum paham mock", linkCommit: "https://github.com/user/repo" }],
    ["dengan satu lampiran", { lampiran: [lampiranOk] }],
    ["dengan lima lampiran", { lampiran: Array.from({ length: 5 }, () => lampiranOk) }],
  ])("menerima: %s", async (_judul, ubahan) => {
    await expect(validasiDto(CreateJurnalDto, { ...dasar, ...ubahan })).resolves.toBeDefined();
  });

  it("melaporkan field bersarang dengan notasi titik", async () => {
    const gagal = await fieldYangGagal(
      validasiDto(CreateJurnalDto, {
        ...dasar,
        lampiran: [{ url: "https://contoh.com/ok.png" }, { url: "bukan-url" }],
      })
    );
    expect(gagal).toContain("lampiran.1.url");
  });

  it.each<[string, Record<string, unknown>, string]>([
    ["kegiatan 9 karakter", { kegiatan: "123456789" }, "kegiatan"],
    ["kegiatan hanya spasi", { kegiatan: "            " }, "kegiatan"],
    ["kegiatan 2001 karakter", { kegiatan: "a".repeat(2001) }, "kegiatan"],
    ["pesertaId dari body (harus dari token)", { pesertaId: 99 }, "pesertaId"],
    ["link commit bukan URL", { linkCommit: "bukan-url" }, "linkCommit"],
    ["lampiran bukan array", { lampiran: "abc" }, "lampiran"],
    ["lampiran lebih dari 5 item", { lampiran: Array.from({ length: 6 }, () => lampiranOk) }, "lampiran"],
  ])("menolak: %s", async (_judul, ubahan, fieldDiharapkan) => {
    const gagal = await fieldYangGagal(validasiDto(CreateJurnalDto, { ...dasar, ...ubahan }));
    expect(gagal).toContain(fieldDiharapkan);
  });

  it("pesertaId adalah SATU-SATUNYA yang ditolak ketika dikirim bersama data sah", async () => {
    const gagal = await fieldYangGagal(validasiDto(CreateJurnalDto, { ...dasar, pesertaId: 99 }));
    expect(gagal).toEqual(["pesertaId"]);
  });
});

describe("UpdateJurnalDto", () => {
  it.each<[string, Record<string, unknown>]>([
    ["hanya hambatan", { hambatan: "Belum paham nested validation" }],
    ["hanya link commit", { linkCommit: "https://github.com/user/repo" }],
    ["kegiatan baru 10+ karakter", { kegiatan: "Mengulang materi validasi" }],
    ["body kosong (DTO meloloskan, service yang menolak)", {}],
  ])("menerima: %s", async (_judul, payload) => {
    await expect(validasiDto(UpdateJurnalDto, payload)).resolves.toBeDefined();
  });

  it.each<[string, Record<string, unknown>, string]>([
    ["kegiatan pendek", { kegiatan: "pendek" }, "kegiatan"],
    ["link commit bukan URL", { linkCommit: "bukan-url" }, "linkCommit"],
    ["link commit lebih dari 500 karakter", { linkCommit: "https://a.co/" + "x".repeat(500) }, "linkCommit"],
    ["statusReview (hanya mentor lewat endpoint review)", { statusReview: "disetujui" }, "statusReview"],
    ["pesertaId", { pesertaId: 1 }, "pesertaId"],
  ])("menolak: %s", async (_judul, payload, fieldDiharapkan) => {
    const gagal = await fieldYangGagal(validasiDto(UpdateJurnalDto, payload));
    expect(gagal).toContain(fieldDiharapkan);
  });
});

describe("ReviewJurnalDto: validasi bersyarat", () => {
  it.each<[string, Record<string, unknown>]>([
    ["belum tanpa catatan", { statusReview: "belum" }],
    ["belum dengan catatan pendek (tidak divalidasi saat belum)", { statusReview: "belum", catatan: "x" }],
    ["revisi dengan catatan", { statusReview: "revisi", catatan: "Tolong perjelas bagian hambatan" }],
    ["disetujui dengan catatan 5 karakter", { statusReview: "disetujui", catatan: "Bagus" }],
  ])("menerima: %s", async (_judul, payload) => {
    await expect(validasiDto(ReviewJurnalDto, payload)).resolves.toBeDefined();
  });

  it("catatan wajib jika disetujui", async () => {
    const gagal = await fieldYangGagal(validasiDto(ReviewJurnalDto, { statusReview: "disetujui" }));
    expect(gagal).toEqual(["catatan"]);
  });

  it("catatan wajib jika revisi", async () => {
    const gagal = await fieldYangGagal(validasiDto(ReviewJurnalDto, { statusReview: "revisi" }));
    expect(gagal).toEqual(["catatan"]);
  });

  it.each<[string, Record<string, unknown>, string]>([
    ["catatan 4 karakter", { statusReview: "disetujui", catatan: "Baik" }, "catatan"],
    ["catatan lebih dari 1000 karakter", { statusReview: "revisi", catatan: "a".repeat(1001) }, "catatan"],
    ["status selesai (tidak dikenal)", { statusReview: "selesai", catatan: "Sudah bagus" }, "statusReview"],
    ["status sudah (nilai lama sebelum jadi 3 status)", { statusReview: "sudah", catatan: "Sudah bagus" }, "statusReview"],
    ["properti asing", { statusReview: "belum", reviewerId: 5 }, "reviewerId"],
  ])("menolak: %s", async (_judul, payload, fieldDiharapkan) => {
    const gagal = await fieldYangGagal(validasiDto(ReviewJurnalDto, payload));
    expect(gagal).toContain(fieldDiharapkan);
  });

  it("menolak body kosong", async () => {
    const gagal = await fieldYangGagal(validasiDto(ReviewJurnalDto, {}));
    expect(gagal).toContain("statusReview");
  });
});

describe("ListJurnalQueryDto", () => {
  it.each<[string, Record<string, unknown>]>([
    ["query kosong", {}],
    ["filter statusReview", { statusReview: "belum" }],
    ["rentang tanggal", { from: "2026-09-01", to: "2026-09-30" }],
    ["pesertaId angka", { pesertaId: "5" }],
  ])("menerima: %s", async (_judul, query) => {
    await expect(validasiDto(ListJurnalQueryDto, query, "query")).resolves.toBeDefined();
  });

  describe("regresi: boolean dari query string", () => {
    it("belumDireview=false benar-benar bernilai false (bukan true)", async () => {
      const q = await validasiDto(ListJurnalQueryDto, { belumDireview: "false" }, "query");
      expect(q.belumDireview).toBe(false);
    });

    it("belumDireview=true bernilai true", async () => {
      const q = await validasiDto(ListJurnalQueryDto, { belumDireview: "true" }, "query");
      expect(q.belumDireview).toBe(true);
    });
  });

  it.each<[string, Record<string, unknown>, string]>([
    ["belumDireview bukan boolean", { belumDireview: "abc" }, "belumDireview"],
    ["sortBy di luar whitelist", { sortBy: "catatanMentor" }, "sortBy"],
    ["sortBy password", { sortBy: "password" }, "sortBy"],
    ["statusReview tidak dikenal", { statusReview: "selesai" }, "statusReview"],
    ["from bukan tanggal", { from: "kemarin" }, "from"],
    ["to bukan tanggal", { to: "besok" }, "to"],
    ["pesertaId bukan angka", { pesertaId: "abc" }, "pesertaId"],
    ["pesertaId nol", { pesertaId: "0" }, "pesertaId"],
  ])("menolak: %s", async (_judul, query, fieldDiharapkan) => {
    const gagal = await fieldYangGagal(validasiDto(ListJurnalQueryDto, query, "query"));
    expect(gagal).toContain(fieldDiharapkan);
  });
});
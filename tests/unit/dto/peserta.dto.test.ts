import { ListPesertaQueryDto, UpdateProfilDto } from "../../../src/dto/peserta.dto";
import { validasiDto } from "../../../src/utils/validasi.util";
import { fieldYangGagal } from "../../helpers/dto";

describe("UpdateProfilDto", () => {
  it.each<[string, Record<string, unknown>]>([
    ["hanya nama", { nama: "Dewi Lestari" }],
    ["hanya sekolah", { sekolah: "SMK Negeri 4" }],
    ["telepon format 08", { telepon: "081234567890" }],
    ["telepon format +62", { telepon: "+6281234567890" }],
    ["body kosong (DTO meloloskan, service yang menolak)", {}],
  ])("menerima: %s", async (_judul, payload) => {
    await expect(validasiDto(UpdateProfilDto, payload)).resolves.toBeDefined();
  });

  it("membuang spasi tepi pada nama", async () => {
    const hasil = await validasiDto(UpdateProfilDto, { nama: "  Dewi  " });
    expect(hasil.nama).toBe("Dewi");
  });

  it.each<[string, Record<string, unknown>, string]>([
    ["nama 2 karakter", { nama: "De" }, "nama"],
    ["nama bukan teks", { nama: 123 }, "nama"],
    ["telepon terlalu pendek", { telepon: "12345" }, "telepon"],
    ["telepon berisi huruf", { telepon: "08abc12345" }, "telepon"],
    ["role (mass assignment)", { role: "mentor" }, "role"],
    ["id (mass assignment)", { id: 99 }, "id"],
    ["password", { password: "baru12345" }, "password"],
    ["email", { email: "x@mail.com" }, "email"],
  ])("menolak: %s", async (_judul, payload, fieldDiharapkan) => {
    const gagal = await fieldYangGagal(validasiDto(UpdateProfilDto, payload));
    expect(gagal).toContain(fieldDiharapkan);
  });

  it("menolak role walau dikirim bersama field yang sah (seluruh request ditolak)", async () => {
    const gagal = await fieldYangGagal(
      validasiDto(UpdateProfilDto, { nama: "Budi Santoso", role: "mentor" })
    );
    expect(gagal).toEqual(["role"]);
  });
});

describe("ListPesertaQueryDto", () => {
  it("memakai nilai bawaan jika query kosong", async () => {
    const q = await validasiDto(ListPesertaQueryDto, {}, "query");
    expect(q).toMatchObject({ page: 1, limit: 10, order: "DESC", sortBy: "createdAt" });
  });

  it("mengubah string dari query menjadi angka", async () => {
    const q = await validasiDto(ListPesertaQueryDto, { page: "2", limit: "20" }, "query");
    expect(q.page).toBe(2);
    expect(q.limit).toBe(20);
  });

  it("menerima order huruf kecil lalu mengubahnya ke huruf besar", async () => {
    const q = await validasiDto(ListPesertaQueryDto, { order: "asc" }, "query");
    expect(q.order).toBe("ASC");
  });

  it("menerima limit tepat 100 dan fase 1", async () => {
    const q = await validasiDto(ListPesertaQueryDto, { limit: "100", fase: "1" }, "query");
    expect(q.limit).toBe(100);
    expect(q.fase).toBe(1);
  });

  it("q berisi spasi saja menjadi string kosong (service menganggapnya tanpa pencarian)", async () => {
    const q = await validasiDto(ListPesertaQueryDto, { q: "   " }, "query");
    expect(q.q).toBe("");
  });

  it("mengabaikan parameter asing di query (tidak menolak)", async () => {
    const q = await validasiDto(ListPesertaQueryDto, { foo: "bar" }, "query");
    expect(q).not.toHaveProperty("foo");
  });

  it.each<[string, Record<string, unknown>, string]>([
    ["page nol", { page: "0" }, "page"],
    ["page bukan angka", { page: "abc" }, "page"],
    ["page terlalu besar", { page: "1e21" }, "page"],
    ["limit nol", { limit: "0" }, "limit"],
    ["limit 101", { limit: "101" }, "limit"],
    ["sortBy di luar whitelist", { sortBy: "password" }, "sortBy"],
    ["order sembarang", { order: "sembarang" }, "order"],
    ["sekolah ganda (array)", { sekolah: ["a", "b"] }, "sekolah"],
    ["fase di luar rentang", { fase: "9" }, "fase"],
  ])("menolak: %s", async (_judul, query, fieldDiharapkan) => {
    const gagal = await fieldYangGagal(validasiDto(ListPesertaQueryDto, query, "query"));
    expect(gagal).toContain(fieldDiharapkan);
  });
});
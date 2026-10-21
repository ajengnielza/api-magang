import { LoginDto, RefreshTokenDto, RegisterDto } from "../../../src/dto/auth.dto";
import { validasiDto } from "../../../src/utils/validasi.util";
import { fieldYangGagal } from "../../helpers/dto";

const p72 = "a1" + "x".repeat(70);
const p73 = "a1" + "x".repeat(71);

describe("RegisterDto", () => {
  const valid = {
    nama: "Budi Santoso",
    sekolah: "SMK 5 Malang",
    email: "budi@mail.com",
    password: "rahasia123",
    konfirmasiPassword: "rahasia123",
  };

  it.each<[string, Record<string, unknown>]>([
    ["data lengkap", {}],
    ["nama tepat 3 karakter", { nama: "Bud" }],
    ["nama tepat 100 karakter", { nama: "a".repeat(100) }],
    ["password tepat 72 karakter", { password: p72, konfirmasiPassword: p72 }],
    ["password berisi spasi dan simbol", { password: "rahasia 123!", konfirmasiPassword: "rahasia 123!" }],
  ])("menerima: %s", async (_judul, ubahan) => {
    await expect(validasiDto(RegisterDto, { ...valid, ...ubahan })).resolves.toBeDefined();
  });

  it("menormalkan email: buang spasi tepi dan ubah ke huruf kecil", async () => {
    const hasil = await validasiDto(RegisterDto, { ...valid, email: "  Budi@Mail.COM  " });
    expect(hasil.email).toBe("budi@mail.com");
  });

  it("membuang spasi tepi pada nama", async () => {
    const hasil = await validasiDto(RegisterDto, { ...valid, nama: "  Budi Santoso  " });
    expect(hasil.nama).toBe("Budi Santoso");
  });

  it("TIDAK mengubah password (spasi tepi dipertahankan)", async () => {
    const pw = " rahasia123 ";
    const hasil = await validasiDto(RegisterDto, { ...valid, password: pw, konfirmasiPassword: pw });
    expect(hasil.password).toBe(pw);
  });

  it.each<[string, Record<string, unknown>, string]>([
    ["nama hanya 2 karakter", { nama: "Bu" }, "nama"],
    ["nama hanya spasi", { nama: "      " }, "nama"],
    ["nama 101 karakter", { nama: "a".repeat(101) }, "nama"],
    ["nama bukan teks", { nama: 123 }, "nama"],
    ["sekolah kosong", { sekolah: "" }, "sekolah"],
    ["email salah format", { email: "bukan-email" }, "email"],
    ["password tanpa angka", { password: "hanyahuruf", konfirmasiPassword: "hanyahuruf" }, "password"],
    ["password tanpa huruf", { password: "12345678", konfirmasiPassword: "12345678" }, "password"],
    ["password 7 karakter", { password: "abc1234", konfirmasiPassword: "abc1234" }, "password"],
    ["password 73 karakter", { password: p73, konfirmasiPassword: p73 }, "password"],
    ["konfirmasi password berbeda", { konfirmasiPassword: "lain12345" }, "konfirmasiPassword"],
    ["properti asing role", { role: "mentor" }, "role"],
  ])("menolak: %s", async (_judul, ubahan, fieldDiharapkan) => {
    const gagal = await fieldYangGagal(validasiDto(RegisterDto, { ...valid, ...ubahan }));
    expect(gagal).toContain(fieldDiharapkan);
  });

  it("menolak body kosong dan melaporkan semua field wajib", async () => {
    const gagal = await fieldYangGagal(validasiDto(RegisterDto, {}));
    expect(gagal).toEqual(
      expect.arrayContaining(["nama", "sekolah", "email", "password", "konfirmasiPassword"])
    );
  });

  it("menolak body yang tidak ada (undefined) seperti body kosong", async () => {
    const gagal = await fieldYangGagal(validasiDto(RegisterDto, undefined));
    expect(gagal).toContain("nama");
  });

  it("menolak body yang bukan objek (array)", async () => {
    const gagal = await fieldYangGagal(validasiDto(RegisterDto, []));
    expect(gagal).toEqual(["body"]);
  });
});

describe("LoginDto", () => {
  const valid = { email: "dewi@test.com", password: "passwordAman123" };

  it.each<[string, Record<string, unknown>]>([
    ["data lengkap", {}],
    ["password lemah tetap diterima (aturan kekuatan hanya saat register)", { password: "a" }],
    ["password dengan spasi tepi", { password: " spasi " }],
  ])("menerima: %s", async (_judul, ubahan) => {
    await expect(validasiDto(LoginDto, { ...valid, ...ubahan })).resolves.toBeDefined();
  });

  it("menormalkan email", async () => {
    const hasil = await validasiDto(LoginDto, { ...valid, email: "  DEWI@Test.COM " });
    expect(hasil.email).toBe("dewi@test.com");
  });

  it.each<[string, Record<string, unknown>, string]>([
    ["email salah format", { email: "bukan-email" }, "email"],
    ["email bukan teks", { email: true }, "email"],
    ["password berupa angka", { password: 123 }, "password"],
    ["password kosong", { password: "" }, "password"],
    ["properti asing role", { role: "mentor" }, "role"],
  ])("menolak: %s", async (_judul, ubahan, fieldDiharapkan) => {
    const gagal = await fieldYangGagal(validasiDto(LoginDto, { ...valid, ...ubahan }));
    expect(gagal).toContain(fieldDiharapkan);
  });

  it("menolak body kosong", async () => {
    const gagal = await fieldYangGagal(validasiDto(LoginDto, {}));
    expect(gagal).toEqual(expect.arrayContaining(["email", "password"]));
  });
});

describe("RefreshTokenDto", () => {
  it.each<[string, unknown]>([
    ["token biasa", { refreshToken: "aaa.bbb.ccc" }],
    ["token 2048 karakter", { refreshToken: "a".repeat(2048) }],
    ["token dengan karakter titik dan strip", { refreshToken: "eyJ.abc-def_ghi.xyz" }],
  ])("menerima: %s", async (_judul, payload) => {
    await expect(validasiDto(RefreshTokenDto, payload)).resolves.toBeDefined();
  });

  it.each<[string, unknown, string]>([
    ["body kosong", {}, "refreshToken"],
    ["token berupa angka", { refreshToken: 123 }, "refreshToken"],
    ["token kosong", { refreshToken: "" }, "refreshToken"],
    ["token 2049 karakter", { refreshToken: "a".repeat(2049) }, "refreshToken"],
    ["properti asing", { refreshToken: "abc", role: "mentor" }, "role"],
  ])("menolak: %s", async (_judul, payload, fieldDiharapkan) => {
    const gagal = await fieldYangGagal(validasiDto(RefreshTokenDto, payload));
    expect(gagal).toContain(fieldDiharapkan);
  });
});
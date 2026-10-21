import { LoginDto, RegisterDto } from "../../../src/dto/auth.dto";
import { ListJurnalQueryDto } from "../../../src/dto/jurnal.dto";
import { ListPesertaQueryDto, UpdateProfilDto } from "../../../src/dto/peserta.dto";
import { ValidationError } from "../../../src/utils/AppError";
import { validasiDto } from "../../../src/utils/validasi.util";
import { fieldYangGagal, tangkapError } from "../../helpers/dto";

describe("keamanan: mass assignment lewat UpdateProfilDto", () => {
  it.each(["role", "id", "password", "email"])(
    "properti %s tidak bisa dikirim lewat UpdateProfilDto",
    async (properti) => {
      const gagal = await fieldYangGagal(
        validasiDto(UpdateProfilDto, { [properti]: "nilai-apa-saja" })
      );
      expect(gagal).toEqual([properti]);
    }
  );
});

describe("keamanan: nilai sensitif tidak bocor di error", () => {
  it("nilai password tidak muncul di detail maupun pesan error", async () => {
    const rahasia = "zq1";
    const err = await tangkapError(
      validasiDto(RegisterDto, {
        nama: "Budi Santoso",
        sekolah: "SMK 5 Malang",
        email: "budi@mail.com",
        password: rahasia,
        konfirmasiPassword: rahasia,
      })
    );

    expect(err).toBeInstanceOf(ValidationError);
    const e = err as ValidationError;
    expect(JSON.stringify(e.detail)).not.toContain(rahasia);
    expect(e.message).not.toContain(rahasia);
  });
});


describe("keamanan: sortBy dibatasi whitelist", () => {
  it("ListPesertaQueryDto menolak sortBy=password", async () => {
    const gagal = await fieldYangGagal(
      validasiDto(ListPesertaQueryDto, { sortBy: "password" }, "query")
    );
    expect(gagal).toContain("sortBy");
  });

  it("ListJurnalQueryDto menolak sortBy=password", async () => {
    const gagal = await fieldYangGagal(
      validasiDto(ListJurnalQueryDto, { sortBy: "password" }, "query")
    );
    expect(gagal).toContain("sortBy");
  });

  it("sortBy yang diselipi perintah SQL ditolak", async () => {
    const gagal = await fieldYangGagal(
      validasiDto(
        ListPesertaQueryDto,
        { sortBy: "nama; DROP TABLE peserta" },
        "query"
      )
    );
    expect(gagal).toContain("sortBy");
  });
});


describe("keamanan: email dinormalkan supaya tidak ada akun ganda", () => {
  it.each([
    ["RegisterDto", RegisterDto, { nama: "Budi Santoso", sekolah: "SMK 5", password: "rahasia123", konfirmasiPassword: "rahasia123" }],
    ["LoginDto", LoginDto, { password: "rahasia123" }],
  ])("%s mengubah email ke huruf kecil tanpa spasi tepi", async (_nama, dto, dasar) => {
    const hasil = (await validasiDto(dto as never, { ...dasar, email: "  Budi@Mail.COM  " })) as { email: string };
    expect(hasil.email).toBe("budi@mail.com");
  });
});
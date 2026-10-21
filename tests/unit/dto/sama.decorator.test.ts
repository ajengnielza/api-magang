import { IsString } from "class-validator";
import { Sama } from "../../../src/dto/decorators/sama";
import { validasiDto } from "../../../src/utils/vaSlidasi.util";
import { detailYangGagal, fieldYangGagal } from "../../helpers/dto";

class ContohDto {
  @IsString()
  password!: string;

  @Sama("password")
  konfirmasi!: string;
}

class ContohPesanKustomDto {
  @IsString()
  password!: string;

  @Sama("password", { message: "Konfirmasi tidak cocok" })
  konfirmasi!: string;
}

describe("decorator Sama", () => {
  it("lolos jika nilai kedua field sama", async () => {
    await expect(
      validasiDto(ContohDto, { password: "abc123", konfirmasi: "abc123" })
    ).resolves.toBeDefined();
  });

  it("gagal pada field yang diberi decorator jika nilainya berbeda", async () => {
    const gagal = await fieldYangGagal(
      validasiDto(ContohDto, { password: "abc123", konfirmasi: "beda" })
    );
    expect(gagal).toEqual(["konfirmasi"]);
  });

  it("pesan bawaan menyebut nama field yang dibandingkan", async () => {
    const detail = await detailYangGagal(
      validasiDto(ContohDto, { password: "abc123", konfirmasi: "beda" })
    );
    expect(detail[0].pesan).toBe("konfirmasi harus sama dengan password");
  });

  it("pesan kustom mengalahkan pesan bawaan", async () => {
    const detail = await detailYangGagal(
      validasiDto(ContohPesanKustomDto, { password: "abc123", konfirmasi: "beda" })
    );
    expect(detail[0].pesan).toBe("Konfirmasi tidak cocok");
  });

  it("membedakan huruf besar dan kecil", async () => {
    const gagal = await fieldYangGagal(
      validasiDto(ContohDto, { password: "Abc123", konfirmasi: "abc123" })
    );
    expect(gagal).toEqual(["konfirmasi"]);
  });

  it("kasus tepi: kalau kedua field tidak dikirim, Sama sendiri meloloskannya (undefined === undefined)", async () => {
    const gagal = await fieldYangGagal(validasiDto(ContohDto, {}));
    expect(gagal).toEqual(["password"]);
    expect(gagal).not.toContain("konfirmasi");
  });
});
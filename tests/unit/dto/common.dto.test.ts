import { IdParamDto } from "../../../src/dto/common.dto";
import { validasiDto } from "../../../src/utils/validasi.util";
import { fieldYangGagal } from "../../helpers/dto";

describe("IdParamDto", () => {
  it.each<[string, number]>([
    ["1", 1],
    ["5", 5],
    ["2147483647", 2147483647],
  ])("menerima id %s dan mengubahnya menjadi angka %i", async (teks, angka) => {
    const hasil = await validasiDto(IdParamDto, { id: teks }, "params");
    expect(hasil.id).toBe(angka);
  });

  it.each(["abc", "0", "-1", "1.5", "99999999999", "2147483648", ""])(
    "menolak id '%s'",
    async (teks) => {
      const gagal = await fieldYangGagal(validasiDto(IdParamDto, { id: teks }, "params"));
      expect(gagal).toEqual(["id"]);
    }
  );

  it("menolak params tanpa id", async () => {
    const gagal = await fieldYangGagal(validasiDto(IdParamDto, {}, "params"));
    expect(gagal).toEqual(["id"]);
  });
});
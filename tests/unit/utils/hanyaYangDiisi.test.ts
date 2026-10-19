
import { hanyaYangDiisi } from "../../../src/utils/hanyaYangDiisi";

describe("hanyaYangDiisi", () => {
  it("membuang properti bernilai undefined", () => {
    expect(
      hanyaYangDiisi({ nama: "Budi", sekolah: undefined })
    ).toStrictEqual({ nama: "Budi" });
  });

  it.each([
    { label: "null", nilai: null },
    { label: "string kosong", nilai: "" },
    { label: "angka 0", nilai: 0 },
    { label: "false", nilai: false },
  ])("tetap mempertahankan $label", ({ nilai }) => {
    expect(hanyaYangDiisi({ a: nilai })).toStrictEqual({ a: nilai });
  });

  it("mengembalikan objek kosong jika semua properti undefined", () => {
    expect(
      hanyaYangDiisi({ a: undefined, b: undefined })
    ).toStrictEqual({});
  });

  it("tidak mengubah objek asli", () => {
    const asli = { a: 1, b: undefined };

    hanyaYangDiisi(asli);

    expect(asli).toStrictEqual({ a: 1, b: undefined });
  });
});
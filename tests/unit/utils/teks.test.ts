import { potongTeks } from "../../../src/utils/teks";

describe("potongTeks", () => {
  it("tidak memotong teks yang tidak melebihi batas", () => {
    expect(potongTeks("halo", 10)).toBe("halo");
  });

  it("memotong dan menambah titik tiga jika melebihi batas", () => {
    expect(potongTeks("Belajar TypeScript", 10)).toBe("Belajar...");
  });
  
  it("tidak memotong teks yang panjangnya tepat sama dengan batas", () => {
    expect(potongTeks("halo", 4)).toBe("halo");
  });

  it("teks kosong tetap kosong", () => {
    expect(potongTeks("", 5)).toBe("");
  });

  it("memotong tanpa titik tiga jika batas terlalu kecil untuk memuatnya", () => {
    expect(potongTeks("halo dunia", 2)).toBe("ha");
  });

  it("max 0 menghasilkan teks kosong", () => {
    expect(potongTeks("halo", 0)).toBe("");
  });

  it.each([0, 1, 2, 3, 4, 5, 10, 18, 30])(
    "hasil tidak pernah lebih panjang dari max=%i",
    (max) => {
      expect(
        potongTeks("Belajar TypeScript", max).length
      ).toBeLessThanOrEqual(max);
    }
  );

});
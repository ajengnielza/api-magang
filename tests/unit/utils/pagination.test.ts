
import { buatMeta, escapeLike } from "../../../src/utils/pagination";

describe("buatMeta", () => {
  it("menghitung totalPages dengan pembulatan ke atas", () => {
    expect(buatMeta(1, 10, 25).totalPages).toBe(3);
  });

  it("halaman tengah punya hasNext dan hasPrev", () => {
    expect(buatMeta(2, 10, 25)).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
    });
  });

  it("halaman terakhir tidak punya hasNext", () => {
    expect(buatMeta(3, 10, 25).hasNext).toBe(false);
  });

  it("data kosong tetap menghasilkan 1 halaman", () => {
    const meta = buatMeta(1, 10, 0);

    expect(meta.totalPages).toBe(1);
    expect(meta.hasNext).toBe(false);
    expect(meta.hasPrev).toBe(false);
  });

  describe("totalPages untuk berbagai jumlah data", () => {
    it.each([
      [1, 10, 0, 1],
      [1, 10, 1, 1],
      [1, 10, 10, 1],
      [1, 10, 11, 2],
      [1, 10, 100, 10],
      [1, 10, 101, 11],
      [1, 1, 5, 5],
      [1, 100, 99, 1],
    ])(
      "buatMeta(%i, %i, %i) menghasilkan totalPages %i",
      (page, limit, total, diharapkan) => {
        expect(
          buatMeta(page, limit, total).totalPages
        ).toBe(diharapkan);
      }
    );
  });

  describe("hasNext dan hasPrev", () => {
    it.each([
      [1, 10, 25, true, false],
      [2, 10, 25, true, true],
      [3, 10, 25, false, true],
      [1, 10, 0, false, false],
      [99, 10, 54, false, true],
    ])(
      "buatMeta(%i, %i, %i) hasNext=%s hasPrev=%s",
      (
        page: number,
        limit: number,
        total: number,
        hasNext: boolean,
        hasPrev: boolean
      ) => {
        const meta = buatMeta(page, limit, total);

        expect(meta.hasNext).toBe(hasNext);
        expect(meta.hasPrev).toBe(hasPrev);
      }
    );
  });
});

describe("escapeLike", () => {
  it("meng-escape wildcard persen", () => {
    expect(escapeLike("100%")).toBe("100\\%");
  });

  it("meng-escape wildcard underscore", () => {
    expect(escapeLike("a_b")).toBe("a\\_b");
  });

  it("meng-escape backslash", () => {
    expect(escapeLike("a\\b")).toBe("a\\\\b");
  });

  it("tidak mengubah teks biasa", () => {
    expect(escapeLike("budi santoso")).toBe("budi santoso");
  });
});
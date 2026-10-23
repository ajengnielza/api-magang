
import { BaseRepository } from "../../../src/repositories/base.repository";

interface PesertaTest {
  id: number;
  nama: string;
  email: string;
}

class PesertaRepositoryTest extends BaseRepository<PesertaTest> {
  constructor(data: PesertaTest[] = []) {
    super();
    this.seed(data);
  }

  // Membuka seed agar dapat diuji melalui class turunan.
  seedData(data: PesertaTest[]): void {
    this.seed(data);
  }
}

describe("BaseRepository", () => {
  let repository: PesertaRepositoryTest;

  beforeEach(() => {
    repository = new PesertaRepositoryTest([
      { id: 1, nama: "Dewi", email: "dewi@test.com" },
      { id: 3, nama: "Budi", email: "budi@test.com" },
    ]);
  });

  describe("seed dan findAll", () => {
    it("mengembalikan data awal", () => {
      expect(repository.findAll()).toHaveLength(2);
      expect(repository.findAll()[0].nama).toBe("Dewi");
    });

    it("mengganti data awal ketika seed dipanggil kembali", () => {
      repository.seedData([
        { id: 5, nama: "Siti", email: "siti@test.com" },
      ]);

      expect(repository.findAll()).toEqual([
        { id: 5, nama: "Siti", email: "siti@test.com" },
      ]);
    });
  });

  describe("findById", () => {
    it("menemukan data berdasarkan ID", () => {
      expect(repository.findById(3)?.nama).toBe("Budi");
    });

    it("mengembalikan undefined jika ID tidak ditemukan", () => {
      expect(repository.findById(99)).toBeUndefined();
    });
  });

  describe("create", () => {
    it("membuat data dengan ID berikutnya", () => {
      const hasil = repository.create({
        nama: "Ani",
        email: "ani@test.com",
      });

      expect(hasil).toEqual({
        id: 4,
        nama: "Ani",
        email: "ani@test.com",
      });
      expect(repository.findAll()).toHaveLength(3);
    });

    it("memulai ID dari 1 jika data awal kosong", () => {
      const kosong = new PesertaRepositoryTest();

      expect(
        kosong.create({ nama: "Ani", email: "ani@test.com" }).id,
      ).toBe(1);
    });
  });

  describe("update", () => {
    it("memperbarui data yang ditemukan", () => {
      const hasil = repository.update(1, { nama: "Dewi Baru" });

      expect(hasil).toEqual({
        id: 1,
        nama: "Dewi Baru",
        email: "dewi@test.com",
      });
    });

    it("mengembalikan undefined jika ID tidak ditemukan", () => {
      expect(repository.update(99, { nama: "Tidak Ada" })).toBeUndefined();
    });
  });

  describe("delete", () => {
    it("menghapus data yang ditemukan", () => {
      expect(repository.delete(1)).toBe(true);
      expect(repository.findById(1)).toBeUndefined();
      expect(repository.findAll()).toHaveLength(1);
    });

    it("mengembalikan false jika ID tidak ditemukan", () => {
      expect(repository.delete(99)).toBe(false);
    });
  });
});

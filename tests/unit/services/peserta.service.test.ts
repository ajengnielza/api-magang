import { PesertaService } from "../../../src/services/peserta.service";
import type { PesertaRepo } from "../../../src/services/peserta.service";
import { NotFoundError, ValidationError } from "../../../src/utils/AppError";
import { tangkapError } from "../../helpers/dto";
import { buatMockPesertaRepo, Mocked } from "../../helpers/mockRepo";

describe("PesertaService", () => {
  let repo: Mocked<PesertaRepo>;
  let service: PesertaService;

  beforeEach(() => {
    repo = buatMockPesertaRepo();
    service = new PesertaService(repo as unknown as PesertaRepo);
  });

  describe("getById", () => {
    it("mengembalikan peserta jika ditemukan", async () => {
      const peserta = { id: 1, nama: "Budi" };
      repo.findById.mockResolvedValue(peserta);

      await expect(service.getById(1)).resolves.toEqual(peserta);
    });

    it("melempar NotFoundError jika peserta tidak ada", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getById(99)).rejects.toThrow(NotFoundError);
    });

    it("pesan error menyebut id dan tidak mengulang kata 'tidak ditemukan'", async () => {
      repo.findById.mockResolvedValue(null);

      const err = (await tangkapError(service.getById(99))) as Error;
      // toThrow("...") hanya mencocokkan sebagian teks, jadi pakai perbandingan sama persis
      expect(err.message).toBe("Peserta dengan id 99 tidak ditemukan");
    });
  });

  describe("getJurnalMilikPeserta", () => {
    it("mengembalikan id, nama, dan daftar jurnal", async () => {
      repo.findByIdDenganJurnal.mockResolvedValue({
        id: 1, nama: "Budi", jurnalList: [{ id: 10 }, { id: 11 }],
      });

      await expect(service.getJurnalMilikPeserta(1)).resolves.toEqual({
        pesertaId: 1, nama: "Budi", jurnal: [{ id: 10 }, { id: 11 }],
      });
    });

    it("melempar NotFoundError jika peserta tidak ada", async () => {
      repo.findByIdDenganJurnal.mockResolvedValue(null);

      await expect(service.getJurnalMilikPeserta(99)).rejects.toThrow(NotFoundError);
    });
  });

  describe("getProfilSaya", () => {
    it("mengembalikan profil milik user yang login", async () => {
      repo.findById.mockResolvedValue({ id: 4, nama: "Dewi" });

      await expect(service.getProfilSaya(4)).resolves.toMatchObject({ id: 4, nama: "Dewi" });
    });

    it("melempar NotFoundError jika akun sudah tidak ada", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getProfilSaya(4)).rejects.toThrow(NotFoundError);
    });
  });

  describe("daftarPeserta (pagination)", () => {
    it("meneruskan query dan filter ke repository, hasilnya dikembalikan apa adanya", async () => {
      const lq = { page: 2, limit: 5, sortBy: "nama", order: "ASC" as const };
      const filter = { sekolah: "SMK 5 Malang", fase: 1 };
      repo.findPaginated.mockResolvedValue({ data: [{ id: 1 }], total: 11 });

      const hasil = await service.daftarPeserta(lq, filter);

      expect(hasil).toEqual({ data: [{ id: 1 }], total: 11 });
      expect(repo.findPaginated).toHaveBeenCalledWith(lq, filter);
    });
  });

  describe("ubahProfil", () => {
    it("hanya mengirim field yang diisi (undefined dibuang)", async () => {
      repo.update.mockResolvedValue({ id: 1, nama: "Baru" });

      await service.ubahProfil(1, { nama: "Baru", sekolah: undefined });

      // toHaveBeenCalledWith menganggap { sekolah: undefined } sama dengan "tidak ada",
      // jadi periksa argumennya dengan toStrictEqual
      const dikirim = repo.update.mock.calls[0][1];
      expect(dikirim).toStrictEqual({ nama: "Baru" });
    });

    it("melempar ValidationError dan tidak menyentuh database jika tidak ada field", async () => {
      await expect(service.ubahProfil(1, {})).rejects.toThrow(ValidationError);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it("melempar NotFoundError jika peserta tidak ada", async () => {
      repo.update.mockResolvedValue(undefined);

      await expect(service.ubahProfil(99, { nama: "Baru" })).rejects.toThrow(NotFoundError);
    });

    it("mengembalikan data terbaru dari repository", async () => {
      repo.update.mockResolvedValue({ id: 1, nama: "Baru" });

      await expect(service.ubahProfil(1, { nama: "Baru" })).resolves.toEqual({ id: 1, nama: "Baru" });
    });
  });

  describe("delete", () => {
    it("berhasil jika repository menghapus data", async () => {
      repo.delete.mockResolvedValue(true);

      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it("melempar NotFoundError jika tidak ada yang terhapus", async () => {
      repo.delete.mockResolvedValue(false);

      await expect(service.delete(99)).rejects.toThrow(NotFoundError);
    });
  });
});
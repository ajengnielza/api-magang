import { JurnalService } from "../../../src/services/jurnal.service";
import type { JurnalRepo } from "../../../src/services/jurnal.service";
import { ForbiddenError, NotFoundError, ValidationError } from "../../../src/utils/AppError";
import { tangkapError } from "../../helpers/dto";
import { buatMockJurnalRepo, Mocked } from "../../helpers/mockRepo";

describe("JurnalService", () => {
  let repo: Mocked<JurnalRepo>;
  let service: JurnalService;

  // Jurnal id 5 milik peserta id 1
  const jurnalMilikDewi = { id: 5, pesertaId: 1, kegiatan: "Belajar mock dengan Jest" };

  beforeEach(() => {
    repo = buatMockJurnalRepo();
    service = new JurnalService(repo as unknown as JurnalRepo);
  });

  describe("getJurnalSaya dan getById", () => {
    it("getJurnalSaya mengembalikan daftar jurnal milik user", async () => {
      repo.findByPeserta.mockResolvedValue([jurnalMilikDewi]);

      await expect(service.getJurnalSaya(1)).resolves.toEqual([jurnalMilikDewi]);
    });

    it("getById mengembalikan jurnal jika ada", async () => {
      repo.findById.mockResolvedValue(jurnalMilikDewi);

      await expect(service.getById(5)).resolves.toEqual(jurnalMilikDewi);
    });

    it("getById melempar NotFoundError dengan pesan yang benar jika tidak ada", async () => {
      repo.findById.mockResolvedValue(null);

      const err = (await tangkapError(service.getById(99))) as Error;

      expect(err).toBeInstanceOf(NotFoundError);
      expect(err.message).toBe("Jurnal dengan id 99 tidak ditemukan");
    });
  });

  describe("create", () => {
    it("mencatat jurnal atas nama user dari token, dengan status belum", async () => {
      repo.create.mockResolvedValue({ id: 1 });

      await service.create(7, { kegiatan: "Belajar mock dengan Jest" });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ pesertaId: 7, kegiatan: "Belajar mock dengan Jest", statusReview: "belum" })
      );
    });
  });

  describe("update dan kepemilikan", () => {
    it("peserta tidak bisa mengubah jurnal milik peserta lain (ForbiddenError)", async () => {
      repo.findById.mockResolvedValue(jurnalMilikDewi);

      await expect(service.update(5, { hambatan: "x" }, 2, "peserta")).rejects.toThrow(ForbiddenError);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it("pemilik boleh mengubah jurnalnya sendiri", async () => {
      repo.findById.mockResolvedValue(jurnalMilikDewi);
      repo.update.mockResolvedValue({ ...jurnalMilikDewi, hambatan: "x" });

      await expect(service.update(5, { hambatan: "x" }, 1, "peserta")).resolves.toMatchObject({ hambatan: "x" });
    });

    it("mentor boleh mengubah jurnal milik siapa pun", async () => {
      repo.findById.mockResolvedValue(jurnalMilikDewi);
      repo.update.mockResolvedValue({ ...jurnalMilikDewi, hambatan: "x" });

      await expect(service.update(5, { hambatan: "x" }, 3, "mentor")).resolves.toBeDefined();
    });

    it("melempar NotFoundError jika jurnal tidak ada dan tidak menyimpan apa pun", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update(99, { hambatan: "x" }, 1, "peserta")).rejects.toThrow(NotFoundError);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it("melempar ValidationError jika tidak ada field yang diisi", async () => {
      repo.findById.mockResolvedValue(jurnalMilikDewi);

      await expect(service.update(5, {}, 1, "peserta")).rejects.toThrow(ValidationError);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it("field undefined dibuang sebelum dikirim ke repository", async () => {
      repo.findById.mockResolvedValue(jurnalMilikDewi);
      repo.update.mockResolvedValue(jurnalMilikDewi);

      await service.update(5, { kegiatan: undefined, hambatan: "Butuh waktu" }, 1, "peserta");

      expect(repo.update.mock.calls[0][1]).toStrictEqual({ hambatan: "Butuh waktu" });
    });
  });

  describe("updateStatusReview", () => {
    it("mencatat mentor yang me-review beserta catatannya", async () => {
      repo.update.mockResolvedValue({ id: 5 });

      await service.updateStatusReview(5, { statusReview: "disetujui", catatan: "Sudah bagus" }, 3);

      expect(repo.update).toHaveBeenCalledWith(5, {
        statusReview: "disetujui",
        catatanMentor: "Sudah bagus",
        reviewerId: 3,
      });
    });

    it("status belum mengosongkan catatan mentor", async () => {
      repo.update.mockResolvedValue({ id: 5 });

      await service.updateStatusReview(5, { statusReview: "belum" }, 3);

      expect(repo.update).toHaveBeenCalledWith(5, {
        statusReview: "belum",
        catatanMentor: null,
        reviewerId: 3,
      });
    });

    it("melempar NotFoundError jika jurnal tidak ada", async () => {
      repo.update.mockResolvedValue(undefined);

      await expect(
        service.updateStatusReview(99, { statusReview: "revisi", catatan: "Perjelas hambatan" }, 3)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete dan kepemilikan", () => {
    it("peserta tidak bisa menghapus jurnal milik peserta lain", async () => {
      repo.findById.mockResolvedValue(jurnalMilikDewi);

      await expect(service.delete(5, 2, "peserta")).rejects.toThrow(ForbiddenError);
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it("pemilik boleh menghapus jurnalnya sendiri", async () => {
      repo.findById.mockResolvedValue(jurnalMilikDewi);
      repo.delete.mockResolvedValue(true);

      await service.delete(5, 1, "peserta");

      expect(repo.delete).toHaveBeenCalledWith(5);
    });

    it("mentor boleh menghapus jurnal milik siapa pun", async () => {
      repo.findById.mockResolvedValue(jurnalMilikDewi);
      repo.delete.mockResolvedValue(true);

      await expect(service.delete(5, 3, "mentor")).resolves.toBeUndefined();
    });

    it("melempar NotFoundError jika jurnal tidak ada", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.delete(99, 1, "peserta")).rejects.toThrow(NotFoundError);
    });
  });
});
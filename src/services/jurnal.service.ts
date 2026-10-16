import { jurnalRepository } from "../repositories/jurnal.repository";
import { NotFoundError, ForbiddenError, ValidationError, hanyaYangDiisi } from "../utils";
import { ListQuery } from "../utils/pagination";
import { CreateJurnalDto, ReviewJurnalDto, UpdateJurnalDto } from "../dto/jurnal.dto";

export const jurnalService = {
  async getJurnalSaya(userId: number) {
    return jurnalRepository.findByPeserta(userId);
  },

  async getById(id: number) {
    const jurnal = await jurnalRepository.findById(id);
    if (!jurnal) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
    return jurnal;
  },

  async create(pesertaId: number, data: CreateJurnalDto) {
    return jurnalRepository.create({
      pesertaId,
      kegiatan: data.kegiatan,
      hambatan: data.hambatan,
      linkCommit: data.linkCommit,
      lampiran: data.lampiran,
      statusReview: "belum",
    });
  },

  async update(
    id: number,
    data: UpdateJurnalDto,
    userId?: number,
    userRole?: "peserta" | "mentor"
  ) {
    const jurnal = await jurnalRepository.findById(id);
    if (!jurnal) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);

    if (userId && userRole !== "mentor" && jurnal.pesertaId !== userId) {
      throw new ForbiddenError("Kamu tidak berhak mengubah jurnal ini");
    }

    const perubahan = hanyaYangDiisi(data);
    if (Object.keys(perubahan).length === 0) {
      throw new ValidationError([{ field: "body", pesan: "Minimal satu field harus diisi" }]);
    }

    const updated = await jurnalRepository.update(id, perubahan);
    if (!updated) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
    return updated;
  },

  async updateStatusReview(id: number, data: ReviewJurnalDto, reviewerId: number) {
    const updated = await jurnalRepository.update(id, {
      statusReview: data.statusReview,
      catatanMentor: data.statusReview === "belum" ? null : data.catatan,
      reviewerId,
    });
    if (!updated) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
    return updated;
  },

  async delete(id: number, userId?: number, userRole?: "peserta" | "mentor") {
    const jurnal = await jurnalRepository.findById(id);
    if (!jurnal) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);

    if (userId && userRole !== "mentor" && jurnal.pesertaId !== userId) {
      throw new ForbiddenError("Kamu tidak berhak menghapus jurnal ini");
    }

    await jurnalRepository.delete(id);
  },

  async daftarJurnal(
    lq: ListQuery,
    filter: { pesertaId?: number; statusReview?: string; belumDireview?: boolean; from?: string; to?: string }
  ) {
    return jurnalRepository.findPaginated(lq, filter);
  },
};
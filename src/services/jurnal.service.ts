import { jurnalRepository } from "../repositories/jurnal.repository";
import { pesertaRepository } from "../repositories/peserta.repository";
import { StatusReview } from "../entities/Jurnal.entity";
import { JurnalHarian } from "../entities/Jurnal.entity";
import { NotFoundError, ForbiddenError, ValidationError, FieldError } from "../utils";
import { ListQuery } from "../utils/pagination";

const MIN_PANJANG_KEGIATAN = 10;
const STATUS_REVIEW_VALID: StatusReview[] = ["belum", "disetujui", "revisi"];

export const jurnalService = {
  async getAll(filter: { status?: string }) {
    let hasil: JurnalHarian[] = await jurnalRepository.findAll();

    if (filter.status?.trim()) {
      hasil = hasil.filter((j) => j.statusReview === filter.status);
    }
    return hasil;
  },

  async getJurnalSaya(userId: number) {
    return jurnalRepository.findByPeserta(userId);
  },

  async getById(id: number) {
    const jurnal = await jurnalRepository.findById(id);
    if (!jurnal) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
    return jurnal;
  },

  async create(payload: { pesertaId?: number | string; kegiatan?: string }) {
    const errors: FieldError[] = [];

    if (!payload.pesertaId) errors.push({ field: "pesertaId", pesan: "pesertaId wajib diisi" });
    if (!payload.kegiatan) errors.push({ field: "kegiatan", pesan: "kegiatan wajib diisi" });

    if (payload.kegiatan && String(payload.kegiatan).trim().length < MIN_PANJANG_KEGIATAN) {
      errors.push({ field: "kegiatan", pesan: `kegiatan minimal ${MIN_PANJANG_KEGIATAN} karakter` });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    const peserta = await pesertaRepository.findById(Number(payload.pesertaId));
    if (!peserta) {
      throw new ValidationError([
        { field: "pesertaId", pesan: `pesertaId ${payload.pesertaId} tidak ditemukan` }
      ]);
    }

    return jurnalRepository.create({
      pesertaId: Number(payload.pesertaId),
      kegiatan: String(payload.kegiatan),
      statusReview: "belum",
    });
  },

  async update(
    id: number,
    payload: Partial<{ kegiatan: string; hambatan: string; linkCommit: string }>,
    userId?: number,
    userRole?: "peserta" | "mentor"
  ) {
    const jurnal = await jurnalRepository.findById(id);
    if (!jurnal) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);

    if (userId && userRole !== "mentor" && jurnal.pesertaId !== userId) {
      throw new ForbiddenError("Kamu tidak berhak mengubah jurnal ini");
    }

    const updated = await jurnalRepository.update(id, payload);
    if (!updated) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
    return updated;
  },

  async updateStatusReview(id: number, statusReview: string) {
    if (!STATUS_REVIEW_VALID.includes(statusReview as StatusReview)) {
      throw new ValidationError([
        { field: "statusReview", pesan: `statusReview harus salah satu dari: ${STATUS_REVIEW_VALID.join(", ")}` }
      ]);
    }
    const updated = await jurnalRepository.update(id, { statusReview: statusReview as StatusReview });
    if (!updated) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
    return updated;
  },

  async delete(id: number) {
    const berhasil = await jurnalRepository.delete(id);
    if (!berhasil) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
  },

  async daftarJurnal(lq: ListQuery, filter: { pesertaId?: number; statusReview?: string; from?: string; to?: string }) {
    return jurnalRepository.findPaginated(lq, filter);
  },
};
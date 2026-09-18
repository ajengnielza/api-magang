import { jurnalRepository } from "../repositories/jurnal.repository";
import { pesertaRepository } from "../repositories/peserta.repository";
import { Jurnal, StatusReview } from "../types/jurnal.types";
import { NotFoundError, ValidationError } from "../utils";

const MIN_PANJANG_KEGIATAN = 10;
const STATUS_REVIEW_VALID: StatusReview[] = ["belum", "disetujui", "revisi"];

export const jurnalService = {
  getAll(filter: { peserta?: string; status?: string }) {
    let hasil = jurnalRepository.findAll();
    if (filter.peserta?.trim()) hasil = hasil.filter((j) => j.pesertaId === Number(filter.peserta));
    if (filter.status?.trim()) hasil = hasil.filter((j) => j.status === filter.status);
    return hasil;
  },

  getById(id: number) {
    const jurnal = jurnalRepository.findById(id);
    if (!jurnal) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
    return jurnal;
  },

  create(payload: { pesertaId?: number | string; tanggal?: string; kegiatan?: string; status?: string }) {
    if (!payload.pesertaId || !payload.tanggal || !payload.kegiatan) {
      throw new ValidationError("pesertaId, tanggal, dan kegiatan wajib diisi");
    }
    if (String(payload.kegiatan).trim().length < MIN_PANJANG_KEGIATAN) {
      throw new ValidationError(`kegiatan minimal ${MIN_PANJANG_KEGIATAN} karakter`);
    }
    if (!pesertaRepository.findById(Number(payload.pesertaId))) {
      throw new ValidationError(`pesertaId ${payload.pesertaId} tidak ditemukan`);
    }
    return jurnalRepository.create({
      pesertaId: Number(payload.pesertaId),
      tanggal: String(payload.tanggal),
      kegiatan: String(payload.kegiatan),
      status: payload.status === "selesai" ? "selesai" : "belum",
      statusReview: "belum",
    });
  },

  update(id: number, payload: Partial<Omit<Jurnal, "id">>) {
    const updated = jurnalRepository.update(id, payload);
    if (!updated) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
    return updated;
  },

  updateStatusReview(id: number, statusReview: string) {
    if (!STATUS_REVIEW_VALID.includes(statusReview as StatusReview)) {
      throw new ValidationError(`statusReview harus salah satu dari: ${STATUS_REVIEW_VALID.join(", ")}`);
    }
    const updated = jurnalRepository.update(id, { statusReview: statusReview as StatusReview });
    if (!updated) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
    return updated;
  },

  delete(id: number) {
    const berhasil = jurnalRepository.delete(id);
    if (!berhasil) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
  },
};
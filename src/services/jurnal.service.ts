
import { jurnalRepository } from "../repositories/jurnal.repository";
import { pesertaRepository } from "../repositories/peserta.repository";
import { StatusReview } from "../entities/Jurnal.entity";
import { NotFoundError, ValidationError } from "../utils";

const MIN_PANJANG_KEGIATAN = 10;
const STATUS_REVIEW_VALID: StatusReview[] = ["belum", "disetujui", "revisi"];

export const jurnalService = {
  async getAll(filter: { peserta?: string; status?: string }) {
    let hasil = filter.peserta?.trim()
      ? await jurnalRepository.findByPeserta(Number(filter.peserta))
      : await jurnalRepository.findAll();

    if (filter.status?.trim()) {
      hasil = hasil.filter((j) => j.statusReview === filter.status);
    }
    return hasil;
  },

  async getById(id: number) {
    const jurnal = await jurnalRepository.findById(id);
    if (!jurnal) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
    return jurnal;
  },

  async create(payload: { pesertaId?: number | string; kegiatan?: string }) {
    if (!payload.pesertaId || !payload.kegiatan) {
      throw new ValidationError("pesertaId dan kegiatan wajib diisi");
    }
    if (String(payload.kegiatan).trim().length < MIN_PANJANG_KEGIATAN) {
      throw new ValidationError(`kegiatan minimal ${MIN_PANJANG_KEGIATAN} karakter`);
    }

    const peserta = await pesertaRepository.findById(Number(payload.pesertaId));
    if (!peserta) {
      throw new ValidationError(`pesertaId ${payload.pesertaId} tidak ditemukan`);
    }

    return jurnalRepository.create({
      pesertaId: Number(payload.pesertaId),
      kegiatan: String(payload.kegiatan),
      statusReview: "belum",
    });
  },

  async update(id: number, payload: Partial<{ kegiatan: string; hambatan: string; linkCommit: string }>) {
    const updated = await jurnalRepository.update(id, payload);
    if (!updated) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
    return updated;
  },

  async updateStatusReview(id: number, statusReview: string) {
    if (!STATUS_REVIEW_VALID.includes(statusReview as StatusReview)) {
      throw new ValidationError(`statusReview harus salah satu dari: ${STATUS_REVIEW_VALID.join(", ")}`);
    }
    const updated = await jurnalRepository.update(id, { statusReview: statusReview as StatusReview });
    if (!updated) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
    return updated;
  },

  async delete(id: number) {
    const berhasil = await jurnalRepository.delete(id);
    if (!berhasil) throw new NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
  },
};
import { pesertaRepository } from "../repositories/peserta.repository";
import { jurnalRepository } from "../repositories/jurnal.repository";
import { NotFoundError, ValidationError } from "../utils";

export const pesertaService = {
  getAll(filter: { sekolah?: string; fase?: string; limit?: string }) {
    let hasil = pesertaRepository.findAll();
    if (filter.sekolah) hasil = hasil.filter((p) => p.sekolah.includes(String(filter.sekolah)));
    if (filter.fase) hasil = hasil.filter((p) => p.fase === Number(filter.fase));
    if (filter.limit) hasil = hasil.slice(0, Number(filter.limit));
    return hasil;
  },

  getById(id: number) {
    const peserta = pesertaRepository.findById(id);
    if (!peserta) throw new NotFoundError(`Peserta dengan id ${id} tidak ditemukan`);
    return peserta;
  },

  getJurnalMilikPeserta(id: number) {
    const peserta = this.getById(id);
    const jurnal = jurnalRepository.findByPeserta(id);
    return { pesertaId: id, nama: peserta.nama, jurnal };
  },

  create(payload: { nama: string; sekolah: string; fase?: number }) {
    if (!payload.nama || !payload.sekolah) {
      throw new ValidationError("nama dan sekolah wajib diisi");
    }
    return pesertaRepository.create({
      nama: payload.nama,
      sekolah: payload.sekolah,
      fase: Number(payload.fase) || 1,
    });
  },

  update(id: number, payload: Partial<{ nama: string; sekolah: string; fase: number }>) {
    const updated = pesertaRepository.update(id, payload);
    if (!updated) throw new NotFoundError(`Peserta dengan id ${id} tidak ditemukan`);
    return updated;
  },

  delete(id: number) {
    const berhasil = pesertaRepository.delete(id);
    if (!berhasil) throw new NotFoundError(`Peserta dengan id ${id} tidak ditemukan`);
  },
};
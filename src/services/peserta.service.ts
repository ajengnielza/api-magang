
import { pesertaRepository } from "../repositories/peserta.repository";
import { NotFoundError, ValidationError } from "../utils";
import { AppDataSource } from "../config/database.config";
import { Peserta } from "../entities/Peserta.entity";

export const pesertaService = {
  async getAll(filter: { sekolah?: string; fase?: string; limit?: string }) {
    let hasil = filter.sekolah
      ? await pesertaRepository.findBySekolah(filter.sekolah)
      : await pesertaRepository.findAll();

    if (filter.fase) hasil = hasil.filter((p) => p.fase === Number(filter.fase));
    if (filter.limit) hasil = hasil.slice(0, Number(filter.limit));
    return hasil;
  },

  async getById(id: number) {
    const peserta = await pesertaRepository.findById(id);
    if (!peserta) throw new NotFoundError(`Peserta dengan id ${id} tidak ditemukan`);
    return peserta;
  },

  async getJurnalMilikPeserta(id: number) {
    const peserta = await AppDataSource.getRepository(Peserta).findOne({
      where: { id },
      relations: { jurnalList: true },
    });

    if (!peserta) throw new NotFoundError(`Peserta dengan id ${id} tidak ditemukan`);

    return { pesertaId: id, nama: peserta.nama, jurnal: peserta.jurnalList };
  },

  async create(payload: { nama: string; sekolah: string; email: string; fase?: number }) {
    if (!payload.nama || !payload.sekolah) {
      throw new ValidationError("nama dan sekolah wajib diisi");
    }
    return pesertaRepository.create({
      nama: payload.nama,
      sekolah: payload.sekolah,
      email: payload.email,
      fase: Number(payload.fase) || 1,
    });
  },

  async update(id: number, payload: Partial<{ nama: string; sekolah: string; fase: number }>) {
    const updated = await pesertaRepository.update(id, payload);
    if (!updated) throw new NotFoundError(`Peserta dengan id ${id} tidak ditemukan`);
    return updated;
  },

  async delete(id: number) {
    const berhasil = await pesertaRepository.delete(id);
    if (!berhasil) throw new NotFoundError(`Peserta dengan id ${id} tidak ditemukan`);
  },
};
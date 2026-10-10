import { pesertaRepository } from "../repositories/peserta.repository";
import { NotFoundError, ValidationError, ForbiddenError, FieldError, pilihField } from "../utils";
import { AppDataSource } from "../config/database.config";
import { Peserta } from "../entities/Peserta.entity";
import { ListQuery } from "../utils/pagination";

const FIELD_UBAH_PESERTA = ["nama", "sekolah", "telepon"] as const;

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
    const errors: FieldError[] = [];
    if (!payload.nama) errors.push({ field: "nama", pesan: "Nama wajib diisi" });
    if (!payload.sekolah) errors.push({ field: "sekolah", pesan: "Sekolah wajib diisi" });

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    return pesertaRepository.create({
      nama: payload.nama,
      sekolah: payload.sekolah,
      email: payload.email,
      fase: Number(payload.fase) || 1,
    });
  },

  async update(id: number, body: unknown, userId?: number) {
  if (userId && id !== userId) {
    throw new ForbiddenError("Kamu tidak bisa mengubah data peserta lain");
  }

  const perubahan = pilihField(body, FIELD_UBAH_PESERTA);
  if (Object.keys(perubahan).length === 0) {
    throw new ValidationError([
      { field: "body", pesan: `Isi minimal satu field: ${FIELD_UBAH_PESERTA.join(", ")}` },
    ]);
  }

    const updated = await pesertaRepository.update(id, perubahan as Partial<Peserta>);
    if (!updated) throw new NotFoundError(`Peserta dengan id ${id} tidak ditemukan`);
    return updated;
  },

  async delete(id: number) {
    const berhasil = await pesertaRepository.delete(id);
    if (!berhasil) throw new NotFoundError(`Peserta dengan id ${id} tidak ditemukan`);
  },

  async getProfilSaya(userId: number) {
    return this.getById(userId);
  },

  async daftarPeserta(lq: ListQuery, filter: { sekolah?: string; fase?: number }) {
    return pesertaRepository.findPaginated(lq, filter);
  },
};
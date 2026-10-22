import type { UpdateProfilDto } from "../dto/peserta.dto";
import type { pesertaRepository } from "../repositories/peserta.repository";
import { NotFoundError, ValidationError } from "../utils/AppError";
import { hanyaYangDiisi } from "../utils/hanyaYangDiisi";
import type { ListQuery } from "../utils/pagination";

// Tipe repository diambil dari objek aslinya. "import type" menghapus import ini saat runtime,
// jadi file ini TIDAK ikut memuat AppDataSource.
export type PesertaRepo = typeof pesertaRepository;

export class PesertaService {
  // Repository DISUNTIKKAN dari luar, bukan diambil sendiri dari AppDataSource
  constructor(private readonly repo: PesertaRepo) {}

  async getById(id: number) {
    const peserta = await this.repo.findById(id);
    if (!peserta) throw new NotFoundError(`Peserta dengan id ${id}`);
    return peserta;
  }

  async getJurnalMilikPeserta(id: number) {
    const peserta = await this.repo.findByIdDenganJurnal(id);
    if (!peserta) throw new NotFoundError(`Peserta dengan id ${id}`);
    return { pesertaId: id, nama: peserta.nama, jurnal: peserta.jurnalList };
  }

  async getProfilSaya(userId: number) {
    return this.getById(userId);
  }

  async daftarPeserta(lq: ListQuery, filter: { sekolah?: string; fase?: number }) {
    return this.repo.findPaginated(lq, filter);
  }

  async ubahProfil(id: number, data: UpdateProfilDto) {
    const perubahan = hanyaYangDiisi(data);
    if (Object.keys(perubahan).length === 0) {
      throw new ValidationError([{ field: "body", pesan: "Minimal satu field harus diisi" }]);
    }

    const updated = await this.repo.update(id, perubahan);
    if (!updated) throw new NotFoundError(`Peserta dengan id ${id}`);
    return updated;
  }

  async delete(id: number) {
    const berhasil = await this.repo.delete(id);
    if (!berhasil) throw new NotFoundError(`Peserta dengan id ${id}`);
  }
}
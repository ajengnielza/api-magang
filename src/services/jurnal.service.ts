import type { CreateJurnalDto, ReviewJurnalDto, UpdateJurnalDto } from "../dto/jurnal.dto";
import type { jurnalRepository } from "../repositories/jurnal.repository";
import { ForbiddenError, NotFoundError, ValidationError } from "../utils/AppError";
import { hanyaYangDiisi } from "../utils/hanyaYangDiisi";
import type { ListQuery } from "../utils/pagination";

export type JurnalRepo = typeof jurnalRepository;
type Role = "peserta" | "mentor";

export class JurnalService {
  constructor(private readonly repo: JurnalRepo) {}

  async getJurnalSaya(userId: number) {
    return this.repo.findByPeserta(userId);
  }

  async getById(id: number, userId?: number, userRole?: Role) {
    const jurnal = await this.repo.findById(id);

    if (!jurnal) {
      throw new NotFoundError(`Jurnal dengan id ${id}`);
    }

    if (
      userRole !== "mentor" &&
      (userId === undefined || jurnal.pesertaId !== userId)
    ) {
      throw new ForbiddenError("Kamu tidak berhak mengakses jurnal ini");
    }

    return jurnal;
  }

  async create(pesertaId: number, data: CreateJurnalDto) {
    return this.repo.create({
      pesertaId,
      kegiatan: data.kegiatan,
      hambatan: data.hambatan,
      linkCommit: data.linkCommit,
      lampiran: data.lampiran,
      statusReview: "belum",
    });
  }

  async update(id: number, data: UpdateJurnalDto, userId?: number, userRole?: Role) {
    const jurnal = await this.repo.findById(id);
    if (!jurnal) throw new NotFoundError(`Jurnal dengan id ${id}`);

    if (
      userRole !== "mentor" &&
      (userId === undefined || jurnal.pesertaId !== userId)
    ) {
      throw new ForbiddenError("Kamu tidak berhak mengubah jurnal ini");
    }

    const perubahan = hanyaYangDiisi(data);
    if (Object.keys(perubahan).length === 0) {
      throw new ValidationError([{ field: "body", pesan: "Minimal satu field harus diisi" }]);
    }

    const updated = await this.repo.update(id, perubahan);
    if (!updated) throw new NotFoundError(`Jurnal dengan id ${id}`);
    return updated;
  }

  async updateStatusReview(id: number, data: ReviewJurnalDto, reviewerId: number) {
    const updated = await this.repo.update(id, {
      statusReview: data.statusReview,
      catatanMentor: data.statusReview === "belum" ? null : data.catatan,
      reviewerId,
    });
    if (!updated) throw new NotFoundError(`Jurnal dengan id ${id}`);
    return updated;
  }

  async delete(id: number, userId?: number, userRole?: Role) {
    const jurnal = await this.repo.findById(id);
    if (!jurnal) throw new NotFoundError(`Jurnal dengan id ${id}`);

    if (
      userRole !== "mentor" &&
      (userId === undefined || jurnal.pesertaId !== userId)
    ) {
      throw new ForbiddenError("Kamu tidak berhak menghapus jurnal ini");
    }

    await this.repo.delete(id);
  }

  async daftarJurnal(
    lq: ListQuery,
    filter: {
      pesertaId?: number;
      statusReview?: string;
      belumDireview?: boolean;
      from?: string;
      to?: string;
    }
  ) {
    return this.repo.findPaginated(lq, filter);
  }
}

import { AppDataSource } from "../config/database.config";
import { Peserta } from "../entities/Peserta.entity";
import { FindOptionsOrder, FindOptionsWhere, ILike } from "typeorm";
import { ListQuery, escapeLike } from "../utils/pagination";

export const SORT_PESERTA = ["nama", "fase", "createdAt"] as const;

interface FilterPeserta {
  sekolah?: string;
  fase?: number;
}

const repo = AppDataSource.getRepository(Peserta);

export const pesertaRepository = {
  async findAll(): Promise<Peserta[]> {
    return repo.find();
  },

  async findById(id: number): Promise<Peserta | null> {
    return repo.findOneBy({ id });
  },

  async findBySekolah(sekolah: string): Promise<Peserta[]> {
    return repo
      .createQueryBuilder("p")
      .where("p.sekolah ILIKE :sekolah", { sekolah: `%${sekolah}%` })
      .getMany();
  },

  async findByFase(fase: number): Promise<Peserta[]> {
    return repo.find({ where: { fase } });
  },

  async create(payload: Partial<Peserta>): Promise<Peserta> {
    const item = repo.create(payload);
    return repo.save(item);
  },

  async update(id: number, payload: Partial<Peserta>): Promise<Peserta | undefined> {
    const existing = await repo.findOneBy({ id });
    if (!existing) return undefined;
    await repo.update({ id }, payload);
    return { ...existing, ...payload };
  },

  async delete(id: number): Promise<boolean> {
    const result = await repo.delete({ id });
    return (result.affected ?? 0) > 0;
  },

  async findByEmail(email: string): Promise<Peserta | null> {
  return repo.findOneBy({ email });
  },

  async findPaginated(lq: ListQuery, filter: FilterPeserta) {
    const dasar: FindOptionsWhere<Peserta> = {};
    if (filter.sekolah) dasar.sekolah = filter.sekolah;
    if (filter.fase) dasar.fase = filter.fase;

    const where: FindOptionsWhere<Peserta> | FindOptionsWhere<Peserta>[] = lq.q
      ? [
          { ...dasar, nama: ILike(`%${escapeLike(lq.q)}%`) },
          { ...dasar, email: ILike(`%${escapeLike(lq.q)}%`) },
        ]
      : dasar;

    const [data, total] = await repo.findAndCount({
      where,
      order: { [lq.sortBy]: lq.order } as FindOptionsOrder<Peserta>,
      skip: (lq.page - 1) * lq.limit,
      take: lq.limit,
    });

    return { data, total };
  },

  async findByEmailDenganPassword(email: string) {
  return repo
    .createQueryBuilder("p")
    .addSelect("p.password")
    .where("p.email = :email", { email })
    .getOne();
},
};
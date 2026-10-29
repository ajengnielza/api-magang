
import { AppDataSource } from "../config/database.config";
import { JurnalHarian } from "../entities/Jurnal.entity";
import { FindOptionsOrder, FindOptionsWhere, Between, MoreThanOrEqual, LessThanOrEqual, Not, LessThan  } from "typeorm";
import { ListQuery } from "../utils/pagination";

export const SORT_JURNAL = ["createdAt", "statusReview"] as const;
interface FilterJurnal {
  pesertaId?: number;
  statusReview?: string;
  belumDireview?: boolean;
  from?: string;
  to?: string;
}

const repo = AppDataSource.getRepository(JurnalHarian);

export const jurnalRepository = {
  async findAll(): Promise<JurnalHarian[]> {
    return repo.find();
  },

  async findById(id: number): Promise<JurnalHarian | null> {
    return repo.findOneBy({ id });
  },

  async findByPeserta(pesertaId: number): Promise<JurnalHarian[]> {
    return repo.find({ where: { pesertaId } });
  },

  async findByStatus(status: string): Promise<JurnalHarian[]> {
    return repo.find({ where: { statusReview: status as any } });
  },

  async create(payload: Partial<JurnalHarian>): Promise<JurnalHarian> {
    const item = repo.create(payload);
    return repo.save(item);
  },

  async update(id: number, payload: Partial<JurnalHarian>): Promise<JurnalHarian | undefined> {
    const existing = await repo.findOneBy({ id });
    if (!existing) return undefined;
    await repo.update({ id }, payload);
    return { ...existing, ...payload };
  },

  async delete(id: number): Promise<boolean> {
    const result = await repo.delete({ id });
    return (result.affected ?? 0) > 0;
  },


  async findPaginated(lq: ListQuery, filter: FilterJurnal) {
    const where: FindOptionsWhere<JurnalHarian> = {};

    if (filter.pesertaId) where.pesertaId = filter.pesertaId;
    if (filter.statusReview) {
      where.statusReview = filter.statusReview as any;
    } else if (filter.belumDireview === true) {
        where.statusReview = "belum" as any;
    } else if (filter.belumDireview === false) {
        where.statusReview = Not("belum") as any;
    }

   if (filter.from && filter.to) {
  const awal = new Date(filter.from);
  const akhirEksklusif = new Date(filter.to);
  akhirEksklusif.setUTCDate(akhirEksklusif.getUTCDate() + 1);

  where.createdAt = Between(
    awal,
    new Date(akhirEksklusif.getTime() - 1),
  );
} else if (filter.from) {
  where.createdAt = MoreThanOrEqual(new Date(filter.from));
} else if (filter.to) {
  const akhirEksklusif = new Date(filter.to);
  akhirEksklusif.setUTCDate(akhirEksklusif.getUTCDate() + 1);

  where.createdAt = LessThan(akhirEksklusif);
}

    const [data, total] = await repo.findAndCount({
      where,
      order: { [lq.sortBy]: lq.order } as FindOptionsOrder<JurnalHarian>,
      skip: (lq.page - 1) * lq.limit,
      take: lq.limit,
    });

    return { data, total };
  },
};
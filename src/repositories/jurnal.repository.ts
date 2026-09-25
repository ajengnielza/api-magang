
import { AppDataSource } from "../config/database.config";
import { JurnalHarian } from "../entities/Jurnal.entity";

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
};
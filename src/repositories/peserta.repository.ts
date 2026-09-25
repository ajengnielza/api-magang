
import { AppDataSource } from "../config/database.config";
import { Peserta } from "../entities/Peserta.entity";

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
};
import { AppDataSource } from "../config/database.config";
import { RefreshToken } from "../entities/RefreshToken.entity";

const repo = AppDataSource.getRepository(RefreshToken);

export const refreshTokenRepository = {
  async create(payload: { token: string; pesertaId: number; expiresAt: Date }) {
    const item = repo.create(payload);
    return repo.save(item);
  },

  async findByToken(token: string) {
    return repo.findOneBy({ token });
  },

  async deleteByToken(token: string) {
    const result = await repo.delete({ token });
    return (result.affected ?? 0) > 0;
  },
};
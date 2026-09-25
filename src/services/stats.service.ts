
import { pesertaRepository } from "../repositories/peserta.repository";
import { jurnalRepository } from "../repositories/jurnal.repository";
import { AppDataSource } from "../config/database.config";
import { JurnalHarian } from "../entities/Jurnal.entity";

export const statsService = {
  async getStats() {
    const semuaPeserta = await pesertaRepository.findAll();
    const totalPeserta = semuaPeserta.length;

    const semuaJurnal = await jurnalRepository.findAll();
    const totalJurnal = semuaJurnal.length;

    const jurnalBelumDireview = semuaJurnal.filter((j) => j.statusReview === "belum").length;

    const rataRataJurnalPerPeserta =
      totalPeserta === 0 ? 0 : Number((totalJurnal / totalPeserta).toFixed(2));

    return { totalPeserta, totalJurnal, jurnalBelumDireview, rataRataJurnalPerPeserta };
  },

  async getStatsPerPeserta() {
    return AppDataSource
      .getRepository(JurnalHarian)
      .createQueryBuilder("j")
      .select("j.peserta_id", "pesertaId")
      .addSelect("COUNT(*)", "totalJurnal")
      .groupBy("j.peserta_id")
      .getRawMany();
  },
};
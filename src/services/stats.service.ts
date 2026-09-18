import { pesertaRepository } from "../repositories/peserta.repository";
import { jurnalRepository } from "../repositories/jurnal.repository";

export const statsService = {
  getStats() {
    const totalPeserta = pesertaRepository.findAll().length;
    const semuaJurnal = jurnalRepository.findAll();
    const totalJurnal = semuaJurnal.length;
    const jurnalBelumDireview = semuaJurnal.filter((j) => j.statusReview === "belum").length;
    const rataRataJurnalPerPeserta = totalPeserta === 0 ? 0 : Number((totalJurnal / totalPeserta).toFixed(2));
    return { totalPeserta, totalJurnal, jurnalBelumDireview, rataRataJurnalPerPeserta };
  },
};
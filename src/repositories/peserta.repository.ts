import { BaseRepository } from "./base.repository";
import { Peserta } from "../types/peserta.types";
import { dataPeserta } from "../data/dummy";

class PesertaRepository extends BaseRepository<Peserta> {
  constructor() {
    super();
    this.seed(dataPeserta);
  }
  findBySekolah(sekolah: string): Peserta[] {
    return this.data.filter((p) => p.sekolah.toLowerCase().includes(sekolah.toLowerCase()));
  }
  findByFase(fase: number): Peserta[] {
    return this.data.filter((p) => p.fase === fase);
  }
}

export const pesertaRepository = new PesertaRepository();
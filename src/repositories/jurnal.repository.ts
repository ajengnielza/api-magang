import { BaseRepository } from "./base.repository";
import { Jurnal } from "../types/jurnal.types";
import { dataJurnal } from "../data/dummy";

class JurnalRepository extends BaseRepository<Jurnal> {
  constructor() {
    super();
    this.seed(dataJurnal);
  }
  findByPeserta(pesertaId: number): Jurnal[] {
    return this.data.filter((j) => j.pesertaId === pesertaId);
  }
  findByStatus(status: string): Jurnal[] {
    return this.data.filter((j) => j.status === status);
  }
}

export const jurnalRepository = new JurnalRepository();
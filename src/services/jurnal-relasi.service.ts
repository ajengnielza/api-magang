// src/services/jurnal-relasi.service.ts
import { AppDataSource } from "../config/database.config";
import { Peserta } from "../entities/Peserta.entity";
import { JurnalHarian } from "../entities/Jurnal.entity";

// Ambil satu peserta beserta seluruh jurnalnya
export async function getPesertaDenganJurnal(id: number) {
  const pesertaRepo = AppDataSource.getRepository(Peserta);

  const peserta = await pesertaRepo.findOne({
    where: { id },
    relations: { jurnalList: true },
  });

  return peserta;
}

// Ambil semua jurnal beserta nama peserta pemiliknya
export async function getJurnalDenganPeserta() {
  const jurnalRepo = AppDataSource.getRepository(JurnalHarian);

  const jurnalList = await jurnalRepo.find({
    relations: { peserta: true },
  });

  return jurnalList;
}
// src/test-relasi.ts (kalau ditaruh langsung di src/)
import "reflect-metadata";
import { AppDataSource } from "./config/database.config";
import { getPesertaDenganJurnal, getJurnalDenganPeserta } from "./services/jurnal-relasi.service";

async function main() {
  await AppDataSource.initialize();
  console.log("Database terhubung untuk testing");

  const hasil1 = await getPesertaDenganJurnal(1);
  console.log("Peserta + Jurnal:", hasil1?.jurnalList);

  const hasil2 = await getJurnalDenganPeserta();
  hasil2.forEach((j) => {
    console.log(`${j.peserta.nama}: ${j.kegiatan}`);
  });

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error("Error testing:", err);
  process.exit(1);
});
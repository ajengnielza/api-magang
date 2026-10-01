// src/test-relasi.ts (kalau ditaruh langsung di src/)
import "reflect-metadata";
import { AppDataSource } from "./config/database.config";
import { getPesertaDenganJurnal, getJurnalDenganPeserta } from "./services/jurnal-relasi.service";
import { hashPassword, cekPassword, tanpaPassword } from "./utils/password";

async function main() {
  await AppDataSource.initialize();
  console.log("Database terhubung untuk testing");

  const hasil1 = await getPesertaDenganJurnal(1);
  console.log("Peserta + Jurnal:", hasil1?.jurnalList);

  const hasil2 = await getJurnalDenganPeserta();
  hasil2.forEach((j) => {
    console.log(`${j.peserta.nama}: ${j.kegiatan}`);
  });

  const hashRahasia = await hashPassword("rahasia123");
  console.log("Hash:", hashRahasia);

  const cocok = await cekPassword("rahasia123", hashRahasia);
  console.log("Password benar?", cocok); 

  const salah = await cekPassword("salahpassword", hashRahasia);
  console.log("Password salah?", salah); 

  const hashA = await hashPassword("password123");
  const hashB = await hashPassword("passwordBeda");
  const hashC = await hashPassword("password123"); 
  
  console.log("Hash 1:", hashA);
  console.log("Hash 2:", hashB);
  console.log("Hash 3 (password sama dgn hashA):", hashC);

  console.log("Hash1 === Hash3?", hashA === hashC); // FALSE, meski password sama!

  // Tapi keduanya tetap valid untuk password yang sama
  console.log("Cek hashA vs password123:", await cekPassword("password123", hashA)); // true
  console.log("Cek hashC vs password123:", await cekPassword("password123", hashC)); // true

  // Test tanpaPassword
  const peserta = { id: 1, nama: "Kiki", email: "kiki@test.com", password: hashA, role: "peserta" };
  const aman = tanpaPassword(peserta);
  console.log("Data aman (tanpa password):", aman);

  const hashMentor = await hashPassword("mentor123");
  console.log("Hash untuk mentor:", hashMentor);

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error("Error testing:", err);
  process.exit(1);
});

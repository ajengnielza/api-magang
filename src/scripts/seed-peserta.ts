import "reflect-metadata";
import { AppDataSource } from "../config/database.config";
import { pesertaRepository } from "../repositories/peserta.repository";
import { hashPassword } from "../utils/password";

async function main() {
  await AppDataSource.initialize();
  console.log("Database terhubung, mulai seeding...");

  const passwordHash = await hashPassword("password123");

  for (let i = 1; i <= 50; i++) {
    await pesertaRepository.create({
      nama: `Peserta Dummy ${i}`,
      sekolah: i % 2 === 0 ? "SMK Negeri 5 Malang" : "SMK Negeri 1 Malang",
      email: `dummy${i}@test.com`,
      password: passwordHash,
      role: "peserta",
      fase: (i % 3) + 1,
    });
  }

  console.log("50 peserta dummy berhasil dibuat!");
  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error("Error seeding:", err);
  process.exit(1);
});
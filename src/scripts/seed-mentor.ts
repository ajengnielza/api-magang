import "reflect-metadata";
import { AppDataSource } from "../config/database.config";
import { pesertaRepository } from "../repositories/peserta.repository";
import { hashPassword } from "../utils/password";

async function main() {
  await AppDataSource.initialize();
  const email = "mentor@test.com";

  if (await pesertaRepository.findByEmail(email)) {
    console.log("Mentor sudah ada");
  } else {
    await pesertaRepository.create({
      nama: "Mentor Contoh",
      sekolah: "-",
      email,
      password: await hashPassword("mentor123"),
      role: "mentor",
    });
    console.log("Mentor dibuat:", email, "(password: mentor123, khusus development)");
  }

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
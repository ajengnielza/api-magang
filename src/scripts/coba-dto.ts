import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RegisterDto } from "../dto/auth.dto";

const kasus: Record<string, Record<string, unknown>> = {
  "a. valid sempurna": {
    nama: "Budi Santoso", sekolah: "SMK Negeri 1", email: "budi@test.com", password: "rahasia123",
  },
  "b. nama terlalu pendek": {
    nama: "Bu", sekolah: "SMK Negeri 1", email: "budi@test.com", password: "rahasia123",
  },
  "c. email salah format": {
    nama: "Budi Santoso", sekolah: "SMK Negeri 1", email: "bukan-email", password: "rahasia123",
  },
  "d. password tanpa angka": {
    nama: "Budi Santoso", sekolah: "SMK Negeri 1", email: "budi@test.com", password: "rahasiaaja",
  },
  "e. ada properti tambahan": {
    nama: "Budi Santoso", sekolah: "SMK Negeri 1", email: "budi@test.com", password: "rahasia123",
    role: "mentor",
  },
};

async function main(): Promise<void> {
  for (const [judul, payload] of Object.entries(kasus)) {
    const instance = plainToInstance(RegisterDto, payload);
    const errors = await validate(instance);

    console.log(`\n${judul}`);
    if (errors.length === 0) {
      console.log("  hasil: LOLOS (array error kosong)");
      console.log("  properti di instance:", Object.keys(instance).join(", "));
    } else {
      for (const e of errors) {
        console.log(`  ${e.property}: ${Object.values(e.constraints ?? {}).join(" | ")}`);
      }
    }
  }
}

main();
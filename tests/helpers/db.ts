
import { AppDataSource } from "../../src/config/database.config";
import { JurnalHarian } from "../../src/entities/Jurnal.entity";
import { Peserta } from "../../src/entities/Peserta.entity";

type StatusReview = "belum" | "disetujui" | "revisi";

// Pengaman kedua: pastikan database benar-benar database test.
function pastikanDatabaseTest(): void {
  const nama = String(AppDataSource.options.database);

  if (!nama.endsWith("_test")) {
    throw new Error(`Ditolak: database "${nama}" bukan database test`);
  }
}

export async function siapkanDatabase(): Promise<void> {
  const nama = String(AppDataSource.options.database);

  console.log("Database integration test:", nama);

  if (nama !== "magang_test") {
    throw new Error(
      `Integration test harus memakai magang_test, tetapi memakai "${nama}".`
    );
  }

  await AppDataSource.initialize();

  const hasil = await AppDataSource.query(`
    SELECT current_database() AS database,
           current_schema() AS schema
  `);

  console.log("Koneksi PostgreSQL aktual:", hasil);

  await AppDataSource.runMigrations();
}
export async function tutupDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
}

export async function bersihkanDatabase(): Promise<void> {
  pastikanDatabaseTest();

  const tabel = AppDataSource.entityMetadatas
    .map((m) => `"${m.tableName}"`)
    .join(", ");

  await AppDataSource.query(
    `TRUNCATE ${tabel} RESTART IDENTITY CASCADE`
  );
}

export async function buatAkun(
  email: string,
  role: "peserta" | "mentor" = "peserta"
): Promise<Peserta> {
  const repo = AppDataSource.getRepository(Peserta);

  return repo.save(
    repo.create({
      nama: `Akun ${email}`,
      sekolah: "SMK Contoh",
      email,
      password: "HASH_TIDAK_DIPAKAI",
      role,
    })
  );
}

export async function buatJurnal(
  pesertaId: number,
  statusReview: StatusReview = "belum",
  kegiatan = "Jurnal contoh untuk pengujian integrasi"
): Promise<JurnalHarian> {
  const repo = AppDataSource.getRepository(JurnalHarian);

  return repo.save(
    repo.create({ pesertaId, kegiatan, statusReview })
  );
}

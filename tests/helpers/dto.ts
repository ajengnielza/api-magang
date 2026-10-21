import { FieldError, ValidationError } from "../../src/utils/AppError";

// Daftar error per field. Array kosong kalau validasi lolos.
export async function detailYangGagal(proses: Promise<unknown>): Promise<FieldError[]> {
  try {
    await proses;
    return [];
  } catch (err) {
    if (err instanceof ValidationError) return err.detail as FieldError[];
    throw err; // jenis error lain = bug sungguhan, biarkan test gagal
  }
}

// Nama field yang gagal, tanpa duplikat (satu field bisa melanggar beberapa aturan)
export async function fieldYangGagal(proses: Promise<unknown>): Promise<string[]> {
  const detail = await detailYangGagal(proses);
  return Array.from(new Set(detail.map((d) => d.field)));
}

// Mengembalikan error yang dilempar. GAGAL kalau ternyata tidak ada error.
// Pengganti fail() yang tidak ada di Jest modern.
export async function tangkapError(proses: Promise<unknown>): Promise<unknown> {
  try {
    await proses;
  } catch (err) {
    return err;
  }
  throw new Error("Diharapkan melempar error, tetapi proses berhasil");
}
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/AppError";

export function validasiPeserta(req: Request, res: Response, next: NextFunction): void {
  const { nama, sekolah } = req.body;
  const errors: string[] = [];

  if (!nama || typeof nama !== "string" || nama.trim().length < 3) {
    errors.push("Nama wajib diisi, minimal 3 karakter");
  }

  if (!sekolah || typeof sekolah !== "string") {
    errors.push("Sekolah wajib diisi");
  }

  if (errors.length > 0) {
    res.status(400).json({ error: "Validasi gagal", detail: errors });
    return; //  PENTING: jangan panggil next(), hentikan di sini
  }

  next(); //  hanya lanjut kalau semua valid
}


export function validasiBodyWajib(fieldWajib: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.body || typeof req.body !== "object") {
      throw new ValidationError("Body request tidak boleh kosong");
    }
    const fieldHilang = fieldWajib.filter(
      (field) => req.body[field] === undefined || req.body[field] === ""
    );
    if (fieldHilang.length > 0) {
      throw new ValidationError(`Field wajib belum diisi: ${fieldHilang.join(", ")}`, { fieldHilang });
    }
    next();
  };
}

export function validasiJurnal(req: Request, res: Response, next: NextFunction): void {
  const { kegiatan, pesertaId } = req.body;
  const errors: string[] = [];

  if (!kegiatan || typeof kegiatan !== "string" || kegiatan.trim().length < 10) {
    errors.push("Kegiatan wajib diisi, minimal 10 karakter");
  }

  if (pesertaId === undefined || isNaN(Number(pesertaId))) {
    errors.push("pesertaId harus berupa angka");
  }

  if (errors.length > 0) {
    res.status(400).json({ error: "Validasi gagal", detail: errors });
    return;
  }

  next();
}
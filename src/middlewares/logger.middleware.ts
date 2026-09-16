import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const mulai = Date.now();

  // 'finish' event terpanggil otomatis saat response SUDAH selesai dikirim
  res.on("finish", () => {
    const durasi = Date.now() - mulai;
    const waktu = new Date().toISOString();
    console.log(
      `[${waktu}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${durasi}ms`
    );
  });

  next(); 
}
import { Response } from "express";
import { PaginationMeta } from "./pagination";

export function sukses<T>(res: Response, data: T, pesan: string = "Berhasil", statusCode: number = 200): void {
  res.status(statusCode).json({ sukses: true, pesan, data });
}

export function suksesDenganTotal<T>(res: Response, data: T[], pesan: string = "Berhasil"): void {
  res.status(200).json({ sukses: true, pesan, total: data.length, data });
}

export function dibuat<T>(
  res: Response,
  data: T,
  pesan: string = "Data berhasil dibuat",
  lokasi?: string
): void {
  if (lokasi) res.location(lokasi);
  res.status(201).json({ sukses: true, pesan, data });
}

export function suksesDenganMeta<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  pesan: string = "Berhasil"
): void {
  res.status(200).json({ sukses: true, pesan, data, meta });
}
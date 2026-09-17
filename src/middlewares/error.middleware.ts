import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/AppError";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // ValidationError — butuh field detail tambahan
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      sukses: false,
      error: err.message,
      detail: err.detail,
    });
    return;
  }

  //  AppError umum (NotFoundError, UnauthorizedError, dll)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      sukses: false,
      error: err.message,
    });
    return;
  }

  //  Error tak terduga (bug asli, bukan AppError)
  console.error("[UNEXPECTED ERROR]", err);

  res.status(500).json({
    sukses: false,
    error: "Terjadi kesalahan di server",
    ...(process.env.NODE_ENV === "development" && {
      detail: err.message,
      stack: err.stack,
    }),
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    sukses: false,
    error: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
}
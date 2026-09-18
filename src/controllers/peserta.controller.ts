import { Request, Response } from "express";
import { pesertaService } from "../services/peserta.service";
import { asyncHandler, sukses, suksesDenganTotal, dibuat } from "../utils";

export const getSemuaPeserta = asyncHandler((req: Request, res: Response) => {
  const { sekolah, fase, limit } = req.query;
  const hasil = pesertaService.getAll({
    sekolah: sekolah as string | undefined,
    fase: fase as string | undefined,
    limit: limit as string | undefined,
  });
  suksesDenganTotal(res, hasil);
});

export const getPesertaById = asyncHandler((req: Request, res: Response) => {
  const peserta = pesertaService.getById(Number(req.params.id));
  sukses(res, peserta);
});

export const getJurnalByPesertaId = asyncHandler((req: Request, res: Response) => {
  const hasil = pesertaService.getJurnalMilikPeserta(Number(req.params.id));
  sukses(res, hasil);
});

export const buatPeserta = asyncHandler((req: Request, res: Response) => {
  const baru = pesertaService.create(req.body);
  dibuat(res, baru);
});

export const updatePeserta = asyncHandler((req: Request, res: Response) => {
  const updated = pesertaService.update(Number(req.params.id), req.body);
  sukses(res, updated, "Peserta berhasil diperbarui");
});

export const hapusPeserta = asyncHandler((req: Request, res: Response) => {
  pesertaService.delete(Number(req.params.id));
  res.status(204).send();
});
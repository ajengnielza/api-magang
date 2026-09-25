
import { Request, Response } from "express";
import { pesertaService } from "../services/peserta.service";
import { asyncHandler, sukses, suksesDenganTotal, dibuat } from "../utils";

export const getSemuaPeserta = asyncHandler(async (req: Request, res: Response) => {
  const { sekolah, fase, limit } = req.query;
  const hasil = await pesertaService.getAll({
    sekolah: sekolah as string | undefined,
    fase: fase as string | undefined,
    limit: limit as string | undefined,
  });
  suksesDenganTotal(res, hasil);
});

export const getPesertaById = asyncHandler(async (req: Request, res: Response) => {
  const peserta = await pesertaService.getById(Number(req.params.id));
  sukses(res, peserta);
});

export const getJurnalByPesertaId = asyncHandler(async (req: Request, res: Response) => {
  const hasil = await pesertaService.getJurnalMilikPeserta(Number(req.params.id));
  sukses(res, hasil);
});

export const buatPeserta = asyncHandler(async (req: Request, res: Response) => {
  const baru = await pesertaService.create(req.body);
  dibuat(res, baru);
});

export const updatePeserta = asyncHandler(async (req: Request, res: Response) => {
  const updated = await pesertaService.update(Number(req.params.id), req.body);
  sukses(res, updated, "Peserta berhasil diperbarui");
});

export const hapusPeserta = asyncHandler(async (req: Request, res: Response) => {
  await pesertaService.delete(Number(req.params.id));
  res.status(204).send();
});
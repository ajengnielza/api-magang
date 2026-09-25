import { Request, Response } from "express";
import { jurnalService } from "../services/jurnal.service";
import { asyncHandler, sukses, suksesDenganTotal, dibuat } from "../utils";

export const getSemuaJurnal = asyncHandler(async (req: Request, res: Response) => {
  const { peserta, status } = req.query;
  const hasil = await jurnalService.getAll({
    peserta: peserta as string | undefined,
    status: status as string | undefined,
  });
  suksesDenganTotal(res, hasil);
});

export const getJurnalById = asyncHandler(async (req: Request, res: Response) => {
  const jurnal = await jurnalService.getById(Number(req.params.id));
  sukses(res, jurnal);
});

export const buatJurnal = asyncHandler(async (req: Request, res: Response) => {
  const baru = await jurnalService.create(req.body);
  dibuat(res, baru);
});

export const updateJurnal = asyncHandler(async (req: Request, res: Response) => {
  const updated = await jurnalService.update(Number(req.params.id), req.body);
  sukses(res, updated, "Jurnal berhasil diperbarui");
});

export const updateStatusReview = asyncHandler(async (req: Request, res: Response) => {
  const updated = await jurnalService.updateStatusReview(Number(req.params.id), req.body.statusReview);
  sukses(res, updated, "Status review berhasil diperbarui");
});

export const hapusJurnal = asyncHandler(async (req: Request, res: Response) => {
  await jurnalService.delete(Number(req.params.id));
  res.status(204).send();
});
import { Request, Response } from "express";
import { jurnalService } from "../services/jurnal.service";
import { asyncHandler, sukses, suksesDenganTotal, dibuat } from "../utils";

export const getSemuaJurnal = asyncHandler((req: Request, res: Response) => {
  const { peserta, status } = req.query;
  const hasil = jurnalService.getAll({
    peserta: peserta as string | undefined,
    status: status as string | undefined,
  });
  suksesDenganTotal(res, hasil);
});

export const getJurnalById = asyncHandler((req: Request, res: Response) => {
  const jurnal = jurnalService.getById(Number(req.params.id));
  sukses(res, jurnal);
});

export const buatJurnal = asyncHandler((req: Request, res: Response) => {
  const baru = jurnalService.create(req.body);
  dibuat(res, baru);
});

export const updateJurnal = asyncHandler((req: Request, res: Response) => {
  const updated = jurnalService.update(Number(req.params.id), req.body);
  sukses(res, updated, "Jurnal berhasil diperbarui");
});

export const updateStatusReview = asyncHandler((req: Request, res: Response) => {
  const updated = jurnalService.updateStatusReview(Number(req.params.id), req.body.statusReview);
  sukses(res, updated, "Status review berhasil diperbarui");
});

export const hapusJurnal = asyncHandler((req: Request, res: Response) => {
  jurnalService.delete(Number(req.params.id));
  res.status(204).send();
});
import { Request, Response } from "express";
import { jurnalService } from "../services/jurnal.service";
import { asyncHandler, sukses, suksesDenganTotal, dibuat, suksesDenganMeta } from "../utils";
import { parseListQuery, buatMeta } from "../utils/pagination";
import { SORT_JURNAL } from "../repositories/jurnal.repository";

export const getSemuaJurnal = asyncHandler(async (req: Request, res: Response) => {
  const lq = parseListQuery(req.query, SORT_JURNAL);
  const pesertaId = req.query.pesertaId ? Number(req.query.pesertaId) : undefined;
  const statusReview = typeof req.query.statusReview === "string" ? req.query.statusReview : undefined;
  const from = typeof req.query.from === "string" ? req.query.from : undefined;
  const to = typeof req.query.to === "string" ? req.query.to : undefined;

  const { data, total } = await jurnalService.daftarJurnal(lq, { pesertaId, statusReview, from, to });
  suksesDenganMeta(res, data, buatMeta(lq.page, lq.limit, total));
});

export const getJurnalSaya = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const hasil = await jurnalService.getJurnalSaya(userId);
  suksesDenganTotal(res, hasil);
});

export const getJurnalById = asyncHandler(async (req: Request, res: Response) => {
  const jurnal = await jurnalService.getById(Number(req.params.id));
  sukses(res, jurnal);
});

export const buatJurnal = asyncHandler(async (req: Request, res: Response) => {
  const baru = await jurnalService.create(req.body);
  dibuat(res, baru, "Jurnal berhasil dibuat", `/api/v1/jurnal/${baru.id}`);
});

export const updateJurnal = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const updated = await jurnalService.update(id, req.body, userId, userRole);
  sukses(res, updated, "Jurnal berhasil diperbarui");
});

export const updateStatusReview = asyncHandler(async (req: Request, res: Response) => {
  const updated = await jurnalService.updateStatusReview(Number(req.params.id), req.body.statusReview);
  sukses(res, updated, "Status review berhasil diperbarui");
});

export const hapusJurnal = asyncHandler(async (req: Request, res: Response) => {
  await jurnalService.delete(Number(req.params.id), req.user?.id, req.user?.role);
  res.status(204).send();
});
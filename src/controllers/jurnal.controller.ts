import { Request, Response } from "express";
import { jurnalService } from "../services";
import { asyncHandler, sukses, suksesDenganMeta, suksesDenganTotal, dibuat, serialisasi } from "../utils";
import { buatMeta } from "../utils/pagination";
import { ambilDto } from "../middlewares/validasi.middleware";
import { IdParamDto } from "../dto/common.dto";
import {
  CreateJurnalDto, ListJurnalQueryDto, ReviewJurnalDto, UpdateJurnalDto,
} from "../dto/jurnal.dto";
import { JurnalResponseDto } from "../dto/response/jurnal.response";

export const getSemuaJurnal = asyncHandler(async (req: Request, res: Response) => {
  const query = ambilDto<ListJurnalQueryDto>(req, "query");
  const { data, total } = await jurnalService.daftarJurnal(query, {
    pesertaId: query.pesertaId,
    statusReview: query.statusReview,
    belumDireview: query.belumDireview,
    from: query.from,
    to: query.to,
  });
  suksesDenganMeta(res, serialisasi(JurnalResponseDto, data), buatMeta(query.page, query.limit, total));
});

export const getJurnalSaya = asyncHandler(async (req: Request, res: Response) => {
  const hasil = await jurnalService.getJurnalSaya(req.user!.id);
  suksesDenganTotal(res, serialisasi(JurnalResponseDto, hasil));
});

export const getJurnalById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = ambilDto<IdParamDto>(req, "params");
  const jurnal = await jurnalService.getById(id);
  sukses(res, serialisasi(JurnalResponseDto, jurnal));
});

export const buatJurnal = asyncHandler(async (req: Request, res: Response) => {
  const data = ambilDto<CreateJurnalDto>(req);
  const baru = await jurnalService.create(req.user!.id, data);
  dibuat(res, serialisasi(JurnalResponseDto, baru), "Jurnal berhasil dibuat", `/api/v1/jurnal/${baru.id}`);
});

export const updateJurnal = asyncHandler(async (req: Request, res: Response) => {
  const { id } = ambilDto<IdParamDto>(req, "params");
  const data = ambilDto<UpdateJurnalDto>(req);
  const updated = await jurnalService.update(id, data, req.user?.id, req.user?.role);
  sukses(res, serialisasi(JurnalResponseDto, updated), "Jurnal berhasil diperbarui");
});

export const updateStatusReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = ambilDto<IdParamDto>(req, "params");
  const data = ambilDto<ReviewJurnalDto>(req);
  const updated = await jurnalService.updateStatusReview(id, data, req.user!.id);
  sukses(res, serialisasi(JurnalResponseDto, updated), "Status review berhasil diperbarui");
});

export const hapusJurnal = asyncHandler(async (req: Request, res: Response) => {
  const { id } = ambilDto<IdParamDto>(req, "params");
  await jurnalService.delete(id, req.user?.id, req.user?.role);
  res.status(204).send();
});
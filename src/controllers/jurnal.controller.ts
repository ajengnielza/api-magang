import { Request, Response } from "express";
import { jurnalService } from "../services/jurnal.service";
import {
  asyncHandler,
  sukses,
  suksesDenganTotal,
  dibuat,
  suksesDenganMeta,
} from "../utils";
import { buatMeta } from "../utils/pagination";
import { ambilDto } from "../middlewares/validasi.middleware";
import { IdParamDto } from "../dto/common.dto";
import { ListJurnalQueryDto } from "../dto/jurnal.dto";

export const getSemuaJurnal = asyncHandler(async (req: Request, res: Response) => {
  const query = ambilDto<ListJurnalQueryDto>(req, "query");

  const { data, total } = await jurnalService.daftarJurnal(query, {
    pesertaId: query.pesertaId,
    statusReview: query.statusReview,
    belumDireview: query.belumDireview,
    from: query.from,
    to: query.to,
  });

  suksesDenganMeta(res, data, buatMeta(query.page, query.limit, total));
});
export const getJurnalSaya = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const hasil = await jurnalService.getJurnalSaya(userId);
  suksesDenganTotal(res, hasil);
});

export const getJurnalById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = ambilDto<IdParamDto>(req, "params");
  const jurnal = await jurnalService.getById(id);
  sukses(res, jurnal);
});

export const buatJurnal = asyncHandler(async (req: Request, res: Response) => {
  const baru = await jurnalService.create(req.body);
  dibuat(res, baru, "Jurnal berhasil dibuat", `/api/v1/jurnal/${baru.id}`);
});

export const updateJurnal = asyncHandler(async (req: Request, res: Response) => {
  const { id } = ambilDto<IdParamDto>(req, "params");
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const updated = await jurnalService.update(id, req.body, userId, userRole);
  sukses(res, updated, "Jurnal berhasil diperbarui");
});

export const updateStatusReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = ambilDto<IdParamDto>(req, "params");
    const updated = await jurnalService.updateStatusReview(
      id,
      req.body.statusReview
    );
    sukses(res, updated, "Status review berhasil diperbarui");
  }
);

export const hapusJurnal = asyncHandler(async (req: Request, res: Response) => {
  const { id } = ambilDto<IdParamDto>(req, "params");
  await jurnalService.delete(id, req.user?.id, req.user?.role);
  res.status(204).send();
});

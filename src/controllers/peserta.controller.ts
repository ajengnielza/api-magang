
import { Request, Response } from "express";
import { pesertaService } from "../services/peserta.service";
import {
  asyncHandler,
  sukses,
  dibuat,
  suksesDenganMeta,
} from "../utils";
import { buatMeta } from "../utils/pagination";
import { ambilDto } from "../middlewares/validasi.middleware";
import { UpdateProfilDto, ListPesertaQueryDto } from "../dto/peserta.dto";
import { IdParamDto } from "../dto/common.dto";

export const getSemuaPeserta = asyncHandler(async (req: Request, res: Response) => {
  const query = ambilDto<ListPesertaQueryDto>(req, "query");

  const { data, total } = await pesertaService.daftarPeserta(query, {
    sekolah: query.sekolah,
    fase: query.fase,
  });

  suksesDenganMeta(res, data, buatMeta(query.page, query.limit, total));
});

export const getPesertaById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = ambilDto<IdParamDto>(req, "params");
    const peserta = await pesertaService.getById(id);
    sukses(res, peserta);
  }
);

export const getJurnalByPesertaId = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = ambilDto<IdParamDto>(req, "params");
    const hasil = await pesertaService.getJurnalMilikPeserta(id);
    sukses(res, hasil);
  }
);

export const buatPeserta = asyncHandler(
  async (req: Request, res: Response) => {
    const baru = await pesertaService.create(req.body);
    dibuat(res, baru);
  }
);

export const updatePeserta = asyncHandler(async (req: Request, res: Response) => {
  const { id } = ambilDto<IdParamDto>(req, "params");
  const data = ambilDto<UpdateProfilDto>(req);
  const updated = await pesertaService.ubahProfil(id, data);
  sukses(res, updated, "Peserta berhasil diperbarui");
});

export const ubahProfilSaya = asyncHandler(async (req: Request, res: Response) => {
  const data = ambilDto<UpdateProfilDto>(req);
  const updated = await pesertaService.ubahProfil(req.user!.id, data);
  sukses(res, updated, "Profil berhasil diperbarui");
});

export const hapusPeserta = asyncHandler(async (req: Request, res: Response) => {
  const { id } = ambilDto<IdParamDto>(req, "params");
  await pesertaService.delete(id);
  res.status(204).send();
});

export const getProfilSaya = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const peserta = await pesertaService.getProfilSaya(userId);
    sukses(res, peserta);
  }
);

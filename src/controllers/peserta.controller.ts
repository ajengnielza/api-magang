import { Request, Response } from "express";
import { pesertaService } from "../services/peserta.service";
import { asyncHandler, sukses, suksesDenganMeta, serialisasi } from "../utils";
import { buatMeta } from "../utils/pagination";
import { ambilDto } from "../middlewares/validasi.middleware";
import { IdParamDto } from "../dto/common.dto";
import { ListPesertaQueryDto, UpdateProfilDto } from "../dto/peserta.dto";
import { PesertaResponseDto } from "../dto/response/peserta.response";
import { JurnalResponseDto } from "../dto/response/jurnal.response";

export const getSemuaPeserta = asyncHandler(async (req: Request, res: Response) => {
  const query = ambilDto<ListPesertaQueryDto>(req, "query");
  const { data, total } = await pesertaService.daftarPeserta(query, {
    sekolah: query.sekolah,
    fase: query.fase,
  });
  suksesDenganMeta(res, serialisasi(PesertaResponseDto, data), buatMeta(query.page, query.limit, total));
});

export const getPesertaById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = ambilDto<IdParamDto>(req, "params");
  const peserta = await pesertaService.getById(id);
  sukses(res, serialisasi(PesertaResponseDto, peserta));
});

export const getJurnalByPesertaId = asyncHandler(async (req: Request, res: Response) => {
  const { id } = ambilDto<IdParamDto>(req, "params");
  const hasil = await pesertaService.getJurnalMilikPeserta(id);
  sukses(res, {
    pesertaId: hasil.pesertaId,
    nama: hasil.nama,
    jurnal: serialisasi(JurnalResponseDto, hasil.jurnal),
  });
});

export const updatePeserta = asyncHandler(async (req: Request, res: Response) => {
  const { id } = ambilDto<IdParamDto>(req, "params");
  const data = ambilDto<UpdateProfilDto>(req);
  const updated = await pesertaService.ubahProfil(id, data);
  sukses(res, serialisasi(PesertaResponseDto, updated), "Peserta berhasil diperbarui");
});

export const hapusPeserta = asyncHandler(async (req: Request, res: Response) => {
  const { id } = ambilDto<IdParamDto>(req, "params");
  await pesertaService.delete(id);
  res.status(204).send();
});

export const getProfilSaya = asyncHandler(async (req: Request, res: Response) => {
  const peserta = await pesertaService.getProfilSaya(req.user!.id);
  sukses(res, serialisasi(PesertaResponseDto, peserta));
});

export const ubahProfilSaya = asyncHandler(async (req: Request, res: Response) => {
  const data = ambilDto<UpdateProfilDto>(req);
  const updated = await pesertaService.ubahProfil(req.user!.id, data);
  sukses(res, serialisasi(PesertaResponseDto, updated), "Profil berhasil diperbarui");
});
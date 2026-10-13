import { Request, Response } from "express";
import { pesertaService } from "../services/peserta.service";
import {
  asyncHandler,
  sukses,
  suksesDenganTotal,
  dibuat, suksesDenganMeta
} from "../utils";
import { parseListQuery, buatMeta } from "../utils/pagination";
import { SORT_PESERTA } from "../repositories/peserta.repository";
import { ambilDto } from "../middlewares/validasi.middleware";
import { UpdateProfilDto } from "../dto/peserta.dto";

export const getSemuaPeserta = asyncHandler(async (req: Request, res: Response) => {
  const lq = parseListQuery(req.query, SORT_PESERTA);
  const sekolah = typeof req.query.sekolah === "string" ? req.query.sekolah : undefined;
  const fase = req.query.fase ? Number(req.query.fase) : undefined;

  const { data, total } = await pesertaService.daftarPeserta(lq, { sekolah, fase });
  suksesDenganMeta(res, data, buatMeta(lq.page, lq.limit, total));
});

export const getPesertaById = asyncHandler(
  async (req: Request, res: Response) => {
    const peserta = await pesertaService.getById(
      Number(req.params.id)
    );

    sukses(res, peserta);
  }
);

export const getJurnalByPesertaId = asyncHandler(
  async (req: Request, res: Response) => {
    const hasil = await pesertaService.getJurnalMilikPeserta(
      Number(req.params.id)
    );

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
  const data = ambilDto<UpdateProfilDto>(req);
  const updated = await pesertaService.ubahProfil(Number(req.params.id), data);
  sukses(res, updated, "Peserta berhasil diperbarui");
});

export const ubahProfilSaya = asyncHandler(async (req: Request, res: Response) => {
  const data = ambilDto<UpdateProfilDto>(req);
  const updated = await pesertaService.ubahProfil(req.user!.id, data);
  sukses(res, updated, "Profil berhasil diperbarui");
});;

export const hapusPeserta = asyncHandler(async (req: Request, res: Response) => {
  await pesertaService.delete(Number(req.params.id));
  res.status(204).send();
});

export const getProfilSaya = asyncHandler(
  async (req: Request, res: Response) => {
    // ID user didapat dari JWT melalui authGuard
    const userId = req.user!.id;

    const peserta = await pesertaService.getProfilSaya(
      userId
    );

    sukses(res, peserta);
  }
);

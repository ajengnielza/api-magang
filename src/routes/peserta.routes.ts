import { Router } from "express";

import {
  getSemuaPeserta,
  getPesertaById,
  getJurnalByPesertaId,
  getProfilSaya,
  buatPeserta,
  updatePeserta,
  hapusPeserta,
} from "../controllers/peserta.controller";

import { validasiBodyWajib } from "../middlewares/validasi.middleware";
import { authGuard } from "../middlewares/auth.middleware";

const router = Router();


router.get("/", getSemuaPeserta);

router.post(
  "/",
  validasiBodyWajib(["nama", "sekolah"]),
  buatPeserta
);


router.get(
  "/profil-saya",
  authGuard,
  getProfilSaya
);

router.put(
  "/:id",
  authGuard,
  validasiBodyWajib(["nama", "sekolah"]),
  updatePeserta
);

router.delete(
  "/:id",
  authGuard,
  hapusPeserta
);


router.get("/:id", getPesertaById);

router.get("/:id/jurnal", getJurnalByPesertaId);

export default router;
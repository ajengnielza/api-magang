import { Router } from "express";

import {
  getSemuaPeserta,
  getPesertaById,
  getJurnalByPesertaId,
  updatePeserta,
  hapusPeserta,
} from "../controllers/peserta.controller";

import { authGuard } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { UpdateProfilDto } from "../dto/peserta.dto";
import { validasi } from "../middlewares";

const router = Router();

// Mengambil semua peserta
router.get("/", getSemuaPeserta);

// Mengambil peserta berdasarkan ID
router.get("/:id", getPesertaById);

// Mengambil jurnal berdasarkan ID peserta
router.get("/:id/jurnal", getJurnalByPesertaId);

// Memperbarui peserta (wajib login)
router.patch("/:id", authGuard, updatePeserta);

// Menghapus peserta (wajib login sebagai mentor)
router.delete(
  "/:id",
  authGuard,
  requireRole("mentor"),
  hapusPeserta
);
router.patch("/:id", authGuard, requireRole("mentor"), validasi(UpdateProfilDto), updatePeserta);
export default router;
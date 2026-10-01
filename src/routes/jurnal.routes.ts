import { Router } from "express";
import {
  getSemuaJurnal, getJurnalById, getJurnalSaya, buatJurnal,
  updateJurnal, updateStatusReview, hapusJurnal,
} from "../controllers/jurnal.controller";
import { validasiJurnal, validasiUpdateJurnal } from "../middlewares/validasi.middleware";
import { authGuard } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// Peserta & mentor (siapapun yang login) boleh buat jurnal & lihat milik sendiri
router.post("/", authGuard, validasiJurnal, buatJurnal);
router.get("/saya", authGuard, getJurnalSaya);

// HANYA mentor yang boleh lihat SEMUA jurnal
router.get("/", authGuard, requireRole("mentor"), getSemuaJurnal);

// HANYA mentor yang boleh review
router.patch("/:id/review", authGuard, requireRole("mentor"), updateStatusReview);

router.get("/:id", getJurnalById);
router.put("/:id", authGuard, validasiUpdateJurnal, updateJurnal);
router.delete("/:id", authGuard, hapusJurnal);

export default router;
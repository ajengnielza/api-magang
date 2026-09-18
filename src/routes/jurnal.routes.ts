import { Router } from "express";
import {
  getSemuaJurnal, getJurnalById, buatJurnal,
  updateJurnal, updateStatusReview, hapusJurnal,
} from "../controllers/jurnal.controller";
import { validasiBodyWajib } from "../middlewares/validasi.middleware";
import { cekApiKey } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", getSemuaJurnal);
router.get("/:id", getJurnalById);
router.post("/", validasiBodyWajib(["pesertaId", "tanggal", "kegiatan"]), buatJurnal);
router.put("/:id", validasiBodyWajib(["pesertaId", "tanggal", "kegiatan"]), updateJurnal);
router.patch("/:id/review", updateStatusReview);
router.delete("/:id", cekApiKey, hapusJurnal);

export default router;
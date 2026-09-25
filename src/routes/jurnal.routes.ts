import { Router } from "express";
import {
  getSemuaJurnal, getJurnalById, buatJurnal,
  updateJurnal, updateStatusReview, hapusJurnal,
} from "../controllers/jurnal.controller";
import { validasiJurnal } from "../middlewares/validasi.middleware";
import { cekApiKey } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", getSemuaJurnal);
router.get("/:id", getJurnalById);
router.post("/", validasiJurnal, buatJurnal);
router.put("/:id", validasiJurnal, updateJurnal);
router.patch("/:id/review", updateStatusReview);
router.delete("/:id", cekApiKey, hapusJurnal);

export default router;
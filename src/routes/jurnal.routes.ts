import { Router } from "express";
import {
  getSemuaJurnal, getJurnalById, buatJurnal,
  updateJurnal, updateStatusReview, hapusJurnal, getJurnalSaya
} from "../controllers/jurnal.controller";
import { validasiJurnal } from "../middlewares/validasi.middleware";
import { authGuard } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", authGuard, getSemuaJurnal);   
router.get("/saya", authGuard, getJurnalSaya);
router.get("/:id", getJurnalById);
router.post("/", validasiJurnal, buatJurnal);
router.put("/:id", validasiJurnal, updateJurnal);
router.patch("/:id/review", updateStatusReview);
router.delete("/:id", authGuard, hapusJurnal);  

export default router;
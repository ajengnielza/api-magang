import { Router } from "express";
import { authGuard } from "../middlewares/auth.middleware";
import { getProfilSaya } from "../controllers/peserta.controller";
import { getJurnalSaya } from "../controllers/jurnal.controller";

const router = Router();

router.get("/", authGuard, getProfilSaya);         
router.get("/jurnal", authGuard, getJurnalSaya);   

export default router;
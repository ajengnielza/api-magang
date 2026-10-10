import { Router } from "express";
import { authGuard } from "../middlewares/auth.middleware";
import { getProfilSaya, ubahProfilSaya } from "../controllers/peserta.controller";
import { getJurnalSaya } from "../controllers/jurnal.controller";

const router = Router();

router.get("/", authGuard, getProfilSaya);         
router.get("/jurnal", authGuard, getJurnalSaya);   
router.patch("/", authGuard, ubahProfilSaya);

export default router;
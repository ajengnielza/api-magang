import { Router } from "express";
import {
  getSemuaPeserta, getPesertaById, getJurnalByPesertaId,
  buatPeserta, updatePeserta, hapusPeserta,
} from "../controllers/peserta.controller";
import { validasiBodyWajib } from "../middlewares/validasi.middleware";
import { cekApiKey } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", getSemuaPeserta);
router.get("/:id", getPesertaById);
router.get("/:id/jurnal", getJurnalByPesertaId);
router.post("/", validasiBodyWajib(["nama", "sekolah"]), buatPeserta);
router.put("/:id", validasiBodyWajib(["nama", "sekolah"]), updatePeserta);
router.delete("/:id", cekApiKey, hapusPeserta);

export default router;
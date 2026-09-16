import { Router } from "express";
import { pesertaController } from "../controllers";
import { validasiPeserta } from "../middlewares/validasi.middleware";
import { cekApiKey } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", pesertaController.getSemuaPeserta);
router.get("/:id", pesertaController.getPesertaById);
router.get("/:id/jurnal", pesertaController.getJurnalByPesertaId);

router.post("/", validasiPeserta, pesertaController.buatPeserta);
router.put("/:id", validasiPeserta, pesertaController.updatePeserta);
router.delete("/:id", cekApiKey, pesertaController.hapusPeserta);

export default router;
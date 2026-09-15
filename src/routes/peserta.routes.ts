import { Router } from "express";
import { pesertaController } from "../controllers";

const router = Router();

router.get("/", pesertaController.getSemuaPeserta);
router.get("/:id", pesertaController.getPesertaById);
router.get("/:id/jurnal", pesertaController.getJurnalByPesertaId); 
router.post("/", pesertaController.buatPeserta);
router.put("/:id", pesertaController.updatePeserta);
router.delete("/:id", pesertaController.hapusPeserta);

export default router;
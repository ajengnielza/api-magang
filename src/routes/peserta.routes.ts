import { Router } from "express";
import { authGuard } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validasi } from "../middlewares/validasi.middleware";
import { IdParamDto } from "../dto/common.dto";
import { ListPesertaQueryDto, UpdateProfilDto } from "../dto/peserta.dto";
import * as pesertaController from "../controllers/peserta.controller";

const router = Router();

router.get("/", validasi(ListPesertaQueryDto, "query"), pesertaController.getSemuaPeserta);
router.get("/:id", validasi(IdParamDto, "params"), pesertaController.getPesertaById);
router.get("/:id/jurnal", validasi(IdParamDto, "params"), pesertaController.getJurnalByPesertaId);
router.patch(
  "/:id",
  authGuard, requireRole("mentor"),
  validasi(IdParamDto, "params"), validasi(UpdateProfilDto),
  pesertaController.updatePeserta
);
router.delete(
  "/:id",
  authGuard, requireRole("mentor"),
  validasi(IdParamDto, "params"),
  pesertaController.hapusPeserta
);

export default router;
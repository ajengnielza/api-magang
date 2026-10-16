import { Router } from "express";
import { authGuard } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validasi } from "../middlewares/validasi.middleware";
import { IdParamDto } from "../dto/common.dto";
import {
  CreateJurnalDto, ListJurnalQueryDto, ReviewJurnalDto, UpdateJurnalDto,
} from "../dto/jurnal.dto";
import {
  buatJurnal, getJurnalById, getSemuaJurnal, hapusJurnal, updateJurnal, updateStatusReview,
} from "../controllers/jurnal.controller";


const router = Router();

router.post("/", authGuard, validasi(CreateJurnalDto), buatJurnal);
router.get("/", authGuard, requireRole("mentor"), validasi(ListJurnalQueryDto, "query"), getSemuaJurnal);
router.patch(
  "/:id/review",
  authGuard, requireRole("mentor"),
  validasi(IdParamDto, "params"), validasi(ReviewJurnalDto),
  updateStatusReview
);
router.get("/:id", validasi(IdParamDto, "params"), getJurnalById);
router.patch("/:id", authGuard, validasi(IdParamDto, "params"), validasi(UpdateJurnalDto), updateJurnal);
router.delete("/:id", authGuard, validasi(IdParamDto, "params"), hapusJurnal);

export default router;
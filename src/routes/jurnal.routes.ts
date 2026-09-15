import { Router } from "express";
import { jurnalController } from "../controllers";

const router = Router();

router.get("/", jurnalController.getSemuaJurnal);
router.get("/:id", jurnalController.getJurnalById);
router.post("/", jurnalController.buatJurnal);
router.put("/:id", jurnalController.updateJurnal);
router.delete("/:id", jurnalController.hapusJurnal);

export default router;
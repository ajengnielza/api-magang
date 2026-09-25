import { Router } from "express";
import { getStats, getStatsPerPeserta } from "../controllers/stats.controller";

const router = Router();
router.get("/", getStats);
router.get("/per-peserta", getStatsPerPeserta);

export default router;
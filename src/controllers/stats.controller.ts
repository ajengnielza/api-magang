import { Request, Response } from "express";
import { statsService } from "../services/stats.service";
import { asyncHandler, sukses } from "../utils";

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const data = await statsService.getStats();
  sukses(res, data);
});

export const getStatsPerPeserta = asyncHandler(async (req: Request, res: Response) => {
  const data = await statsService.getStatsPerPeserta();
  sukses(res, data);
});
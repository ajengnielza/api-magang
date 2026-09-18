import { Request, Response } from "express";
import { statsService } from "../services/stats.service";
import { asyncHandler, sukses } from "../utils";

export const getStats = asyncHandler((_req: Request, res: Response) => {
  sukses(res, statsService.getStats(), "Statistik berhasil diambil");
});
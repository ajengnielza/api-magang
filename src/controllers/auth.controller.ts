import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler, sukses, dibuat } from "../utils";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.register(req.body);
  dibuat(res, data);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.login(req.body);
  sukses(res, data);
});
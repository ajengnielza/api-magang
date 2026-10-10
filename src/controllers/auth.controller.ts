import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler, sukses, dibuat } from "../utils";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.register(req.body);
  dibuat(res, data, "Registrasi berhasil", `/api/v1/peserta/${data.id}`);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.login(req.body);
  sukses(res, data);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const data = await authService.refresh(refreshToken);
  sukses(res, data);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  sukses(res, null, "Logout berhasil");
});
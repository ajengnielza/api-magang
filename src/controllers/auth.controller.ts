
import { Request, Response } from "express";
import { authService } from "../services";
import { asyncHandler, sukses, dibuat, serialisasi } from "../utils";
import { ambilDto } from "../middlewares/validasi.middleware";
import { RegisterDto, LoginDto } from "../dto/auth.dto";
import { PesertaResponseDto } from "../dto/response/peserta.response";
import {
  NAMA_COOKIE_REFRESH,
  hapusCookieRefresh,
  setCookieRefresh,
} from "../utils/cookie";
import { UnauthorizedError } from "../utils/AppError";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = ambilDto<RegisterDto>(req);
  const hasil = await authService.register(data);

  dibuat(
    res,
    serialisasi(PesertaResponseDto, hasil),
    "Registrasi berhasil",
    `/api/v1/peserta/${hasil.id}`,
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = ambilDto<LoginDto>(req);
  const hasil = await authService.login(data);

  setCookieRefresh(res, hasil.refreshToken);

  sukses(res, {
    accessToken: hasil.accessToken,
    peserta: serialisasi(PesertaResponseDto, hasil.peserta),
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token: unknown = req.cookies?.[NAMA_COOKIE_REFRESH];

  if (typeof token !== "string" || token === "") {
    throw new UnauthorizedError("Sesi tidak ditemukan, silakan login");
  }

  const data = await authService.refresh(token);
  sukses(res, data);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token: unknown = req.cookies?.[NAMA_COOKIE_REFRESH];

  if (typeof token === "string" && token !== "") {
    await authService.logout(token);
  }

  hapusCookieRefresh(res);
  res.status(204).send();
});

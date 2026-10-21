
import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler, sukses, dibuat, serialisasi } from "../utils";
import { ambilDto } from "../middlewares/validasi.middleware";
import { RegisterDto, LoginDto, RefreshTokenDto } from "../dto/auth.dto";
import { PesertaResponseDto } from "../dto/response/peserta.response";

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
  sukses(res, {
    ...hasil,
    peserta: serialisasi(PesertaResponseDto, hasil.peserta),
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = ambilDto<RefreshTokenDto>(req);
  const data = await authService.refresh(refreshToken);
  sukses(res, data);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = ambilDto<RefreshTokenDto>(req);
  await authService.logout(refreshToken);
  sukses(res, null, "Logout berhasil");
});

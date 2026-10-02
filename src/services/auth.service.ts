import { pesertaRepository } from "../repositories/peserta.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { hashPassword, cekPassword } from "../utils/password";
import { buatAccessToken, buatRefreshToken, verifikasiRefreshToken } from "../utils/jwt";
import { ConflictError, UnauthorizedError } from "../utils";

interface RegisterInput {
  nama: string;
  sekolah: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterInput) {
    const sudahAda = await pesertaRepository.findByEmail(data.email);
    if (sudahAda) {
      throw new ConflictError("Email sudah terdaftar");
    }

    const passwordHash = await hashPassword(data.password);

    const tersimpan = await pesertaRepository.create({
      nama: data.nama,
      sekolah: data.sekolah,
      email: data.email,
      password: passwordHash,
      role: "peserta",
    });

    const { password, ...aman } = tersimpan;
    return aman;
  },

  async login(data: LoginInput) {
    const peserta = await pesertaRepository.findByEmail(data.email);

    if (!peserta) {
      throw new UnauthorizedError("Email atau password salah");
    }

    const passwordCocok = await cekPassword(data.password, peserta.password);
    if (!passwordCocok) {
      throw new UnauthorizedError("Email atau password salah");
    }

    const payload = { id: peserta.id, email: peserta.email, role: peserta.role };
    const accessToken = buatAccessToken(payload);
    const refreshToken = buatRefreshToken(payload);

    await refreshTokenRepository.create({
      token: refreshToken,
      pesertaId: peserta.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const { password, ...pesertaAman } = peserta;
    return { accessToken, refreshToken, peserta: pesertaAman };
  },

  async refresh(refreshTokenInput: string) {
    const payload = verifikasiRefreshToken(refreshTokenInput); // lempar error kalau invalid/expired

    const tersimpan = await refreshTokenRepository.findByToken(refreshTokenInput);
    if (!tersimpan) {
      throw new UnauthorizedError("Refresh token tidak dikenali atau sudah dicabut");
    }

    const accessTokenBaru = buatAccessToken({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });

    return { accessToken: accessTokenBaru };
  },

  async logout(refreshTokenInput: string) {
    await refreshTokenRepository.deleteByToken(refreshTokenInput);
  },
};
import type { LoginDto, RegisterDto } from "../dto/auth.dto";
import type { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { ConflictError, UnauthorizedError } from "../utils/AppError";
import { buatAccessToken, buatRefreshToken, verifikasiRefreshToken } from "../utils/jwt";
import { cekPassword, hashPassword } from "../utils/password";
import type { PesertaRepo } from "./peserta.service";

export type RefreshTokenRepo = typeof refreshTokenRepository;

const MASA_REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthService {
  constructor(
    private readonly pesertaRepo: PesertaRepo,
    private readonly refreshRepo: RefreshTokenRepo
  ) {}

  async register(data: RegisterDto) {
    const { konfirmasiPassword, ...dataPeserta } = data;

    const sudahAda = await this.pesertaRepo.findByEmail(dataPeserta.email);
    if (sudahAda) throw new ConflictError("Email sudah terdaftar");

    const passwordHash = await hashPassword(dataPeserta.password);

    const tersimpan = await this.pesertaRepo.create({
      nama: dataPeserta.nama,
      sekolah: dataPeserta.sekolah,
      email: dataPeserta.email,
      password: passwordHash,
      role: "peserta",
    });

    const { password, ...aman } = tersimpan;
    return aman;
  }

  async login(data: LoginDto) {
    const peserta = await this.pesertaRepo.findByEmailDenganPassword(data.email);
    if (!peserta) throw new UnauthorizedError("Email atau password salah");

    const passwordCocok = await cekPassword(data.password, peserta.password);
    if (!passwordCocok) throw new UnauthorizedError("Email atau password salah");

    const payload = { id: peserta.id, email: peserta.email, role: peserta.role };
    const accessToken = buatAccessToken(payload);
    const refreshToken = buatRefreshToken(payload);

    await this.refreshRepo.create({
      token: refreshToken,
      pesertaId: peserta.id,
      expiresAt: new Date(Date.now() + MASA_REFRESH_MS),
    });

    const { password, ...pesertaAman } = peserta;
    return { accessToken, refreshToken, peserta: pesertaAman };
  }

  async refresh(refreshTokenInput: string) {
    const payload = verifikasiRefreshToken(refreshTokenInput);

    const tersimpan = await this.refreshRepo.findByToken(refreshTokenInput);
    if (!tersimpan) {
      throw new UnauthorizedError("Refresh token tidak dikenali atau sudah dicabut");
    }

    const accessToken = buatAccessToken({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });
    return { accessToken };
  }

  async logout(refreshTokenInput: string) {
    await this.refreshRepo.deleteByToken(refreshTokenInput);
  }
}
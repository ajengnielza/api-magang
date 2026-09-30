// src/services/auth.service.ts
import { pesertaRepository } from "../repositories/peserta.repository";
import { hashPassword, cekPassword } from "../utils/password";
import { buatToken } from "../utils/jwt";
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

    const token = buatToken({
      id: peserta.id,
      email: peserta.email,
      role: peserta.role,
    });

    const { password, ...pesertaAman } = peserta;
    return { token, peserta: pesertaAman };
  },
};
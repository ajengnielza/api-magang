import { AuthService } from "../../../src/services/auth.service";
import type { RefreshTokenRepo } from "../../../src/services/auth.service";
import type { PesertaRepo } from "../../../src/services/peserta.service";
import { ConflictError, UnauthorizedError } from "../../../src/utils/AppError";
import { buatAccessToken, buatRefreshToken, verifikasiRefreshToken } from "../../../src/utils/jwt";
import { cekPassword, hashPassword } from "../../../src/utils/password";
import { tangkapError } from "../../helpers/dto";
import { buatMockPesertaRepo, buatMockRefreshTokenRepo, Mocked } from "../../helpers/mockRepo";

jest.mock("../../../src/utils/password", () => ({
  hashPassword: jest.fn(),
  cekPassword: jest.fn(),
}));
jest.mock("../../../src/utils/jwt", () => ({
  buatAccessToken: jest.fn(),
  buatRefreshToken: jest.fn(),
  verifikasiRefreshToken: jest.fn(),
}));

const mockHash = jest.mocked(hashPassword);
const mockCek = jest.mocked(cekPassword);
const mockAccess = jest.mocked(buatAccessToken);
const mockRefreshToken = jest.mocked(buatRefreshToken);
const mockVerifikasi = jest.mocked(verifikasiRefreshToken);

describe("AuthService", () => {
  let pesertaRepo: Mocked<PesertaRepo>;
  let refreshRepo: Mocked<RefreshTokenRepo>;
  let service: AuthService;

  beforeEach(() => {
    pesertaRepo = buatMockPesertaRepo();
    refreshRepo = buatMockRefreshTokenRepo();
    service = new AuthService(
      pesertaRepo as unknown as PesertaRepo,
      refreshRepo as unknown as RefreshTokenRepo
    );

    // Atur ulang jawaban default tiap test (implementasi mock modul bertahan antar test)
    mockHash.mockResolvedValue("HASH_PALSU");
    mockCek.mockResolvedValue(true);
    mockAccess.mockReturnValue("ACCESS_PALSU");
    mockRefreshToken.mockReturnValue("REFRESH_PALSU");
    mockVerifikasi.mockReturnValue({ id: 1, email: "budi@mail.com", role: "peserta" });
  });

  describe("register", () => {
    const data = {
      nama: "Budi Santoso",
      sekolah: "SMK 5 Malang",
      email: "budi@mail.com",
      password: "rahasia123",
      konfirmasiPassword: "rahasia123",
    };
    const tersimpan = {
      id: 1, nama: data.nama, sekolah: data.sekolah, email: data.email,
      password: "HASH_PALSU", role: "peserta",
    };

    it("melempar ConflictError dan tidak menyimpan jika email sudah ada", async () => {
      pesertaRepo.findByEmail.mockResolvedValue({ id: 5, email: data.email });

      await expect(service.register(data)).rejects.toThrow(ConflictError);
      expect(pesertaRepo.create).not.toHaveBeenCalled();
      expect(mockHash).not.toHaveBeenCalled();
    });

    it("menyimpan HASH dari hashPassword, bukan password asli", async () => {
      pesertaRepo.findByEmail.mockResolvedValue(null);
      pesertaRepo.create.mockResolvedValue(tersimpan);

      await service.register(data);

      const disimpan = pesertaRepo.create.mock.calls[0][0];
      expect(mockHash).toHaveBeenCalledWith("rahasia123");
      expect(disimpan.password).toBe("HASH_PALSU");
      expect(disimpan.password).not.toBe("rahasia123");
    });

    it("hasil register tidak mengandung properti password", async () => {
      pesertaRepo.findByEmail.mockResolvedValue(null);
      pesertaRepo.create.mockResolvedValue(tersimpan);

      const hasil = await service.register(data);

      expect(hasil).not.toHaveProperty("password");
      expect(hasil).toMatchObject({ id: 1, email: "budi@mail.com", role: "peserta" });
    });

    it("role selalu peserta dan konfirmasiPassword tidak ikut disimpan", async () => {
      pesertaRepo.findByEmail.mockResolvedValue(null);
      pesertaRepo.create.mockResolvedValue(tersimpan);

      await service.register(data);

      const disimpan = pesertaRepo.create.mock.calls[0][0];
      expect(disimpan.role).toBe("peserta");
      expect(disimpan).not.toHaveProperty("konfirmasiPassword");
    });
  });

  describe("login", () => {
    const input = { email: "budi@mail.com", password: "rahasia123" };
    const pesertaDb = {
      id: 1, nama: "Budi", email: "budi@mail.com", password: "HASH_DB", role: "peserta",
    };

    let spyNow: jest.SpyInstance;
    beforeEach(() => {
      // Kunci jam dinding. Hanya spy ini yang dipulihkan, bukan restoreAllMocks(),
      // karena restoreAllMocks juga melepas spy console dari setupAfterEnv.ts
      spyNow = jest.spyOn(Date, "now").mockReturnValue(new Date("2026-10-19T00:00:00Z").getTime());
    });
    afterEach(() => {
      spyNow.mockRestore();
    });

    it("melempar UnauthorizedError jika email tidak ditemukan", async () => {
      pesertaRepo.findByEmailDenganPassword.mockResolvedValue(null);

      await expect(service.login(input)).rejects.toThrow(UnauthorizedError);
      expect(mockCek).not.toHaveBeenCalled();
    });

    it("melempar UnauthorizedError jika password salah dan tidak membuat token", async () => {
      pesertaRepo.findByEmailDenganPassword.mockResolvedValue(pesertaDb);
      mockCek.mockResolvedValue(false);

      await expect(service.login(input)).rejects.toThrow(UnauthorizedError);
      expect(mockAccess).not.toHaveBeenCalled();
      expect(refreshRepo.create).not.toHaveBeenCalled();
    });

    it("pesan error email salah dan password salah SAMA persis", async () => {
      pesertaRepo.findByEmailDenganPassword.mockResolvedValue(null);
      const errEmail = (await tangkapError(service.login(input))) as Error;

      pesertaRepo.findByEmailDenganPassword.mockResolvedValue(pesertaDb);
      mockCek.mockResolvedValue(false);
      const errPassword = (await tangkapError(service.login(input))) as Error;

      expect(errEmail.message).toBe(errPassword.message);
      expect(errEmail.message).toBe("Email atau password salah");
    });

    it("mencocokkan password input dengan hash dari database", async () => {
      pesertaRepo.findByEmailDenganPassword.mockResolvedValue(pesertaDb);

      await service.login(input);

      expect(mockCek).toHaveBeenCalledWith("rahasia123", "HASH_DB");
    });

    it("sukses: mengembalikan accessToken dan refreshToken", async () => {
      pesertaRepo.findByEmailDenganPassword.mockResolvedValue(pesertaDb);

      const hasil = await service.login(input);

      expect(hasil.accessToken).toBe("ACCESS_PALSU");
      expect(hasil.refreshToken).toBe("REFRESH_PALSU");
    });

    it("sukses: refresh token disimpan dengan masa berlaku tepat 7 hari", async () => {
      pesertaRepo.findByEmailDenganPassword.mockResolvedValue(pesertaDb);

      await service.login(input);

      expect(refreshRepo.create).toHaveBeenCalledWith({
        token: "REFRESH_PALSU",
        pesertaId: 1,
        expiresAt: new Date("2026-10-26T00:00:00Z"),
      });
    });

    it("payload token tidak memuat password", async () => {
      pesertaRepo.findByEmailDenganPassword.mockResolvedValue(pesertaDb);

      await service.login(input);

      expect(mockAccess).toHaveBeenCalledWith({ id: 1, email: "budi@mail.com", role: "peserta" });
    });

    it("data peserta di hasil login tidak mengandung password", async () => {
      pesertaRepo.findByEmailDenganPassword.mockResolvedValue(pesertaDb);

      const hasil = await service.login(input);

      expect(hasil.peserta).not.toHaveProperty("password");
    });
  });

  describe("refresh", () => {
    it("token tidak valid: error asli diteruskan dan database tidak disentuh", async () => {
      mockVerifikasi.mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      await expect(service.refresh("abc")).rejects.toThrow("jwt malformed");
      expect(refreshRepo.findByToken).not.toHaveBeenCalled();
    });

    it("token sah tetapi sudah tidak ada di database: UnauthorizedError", async () => {
      refreshRepo.findByToken.mockResolvedValue(null);

      const err = (await tangkapError(service.refresh("REFRESH_LAMA"))) as Error;

      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.message).toBe("Refresh token tidak dikenali atau sudah dicabut");
    });

    it("sukses: mengembalikan access token baru dari payload refresh token", async () => {
      refreshRepo.findByToken.mockResolvedValue({ id: 1, token: "REFRESH_LAMA" });

      const hasil = await service.refresh("REFRESH_LAMA");

      expect(hasil).toEqual({ accessToken: "ACCESS_PALSU" });
      expect(mockAccess).toHaveBeenCalledWith({ id: 1, email: "budi@mail.com", role: "peserta" });
    });
  });

  describe("logout", () => {
    it("menghapus refresh token yang dikirim", async () => {
      refreshRepo.deleteByToken.mockResolvedValue(true);

      await service.logout("REFRESH_X");

      expect(refreshRepo.deleteByToken).toHaveBeenCalledWith("REFRESH_X");
    });

    it("tetap berhasil walau token sudah tidak ada", async () => {
      refreshRepo.deleteByToken.mockResolvedValue(false);

      await expect(service.logout("REFRESH_X")).resolves.toBeUndefined();
    });
  });
});

jest.mock("../../../src/config/database.config", () => ({
  AppDataSource: {
    getRepository: jest.fn(() => ({
      create: jest.fn((payload) => payload),
      save: jest.fn(async (item) => item),
      findOneBy: jest.fn(async (criteria) => ({
        id: 1,
        ...criteria,
      })),
      delete: jest.fn(async () => ({ affected: 1 })),
    })),
  },
}));

import { refreshTokenRepository } from "../../../src/repositories/refreshToken.repository";

describe("refreshTokenRepository", () => {
  it("membuat dan menyimpan refresh token", async () => {
    const payload = {
      token: "token-test",
      pesertaId: 1,
      expiresAt: new Date("2026-12-31T00:00:00Z"),
    };

    await expect(refreshTokenRepository.create(payload)).resolves.toEqual(
      payload,
    );
  });

  it("mencari refresh token berdasarkan token", async () => {
    await expect(
      refreshTokenRepository.findByToken("token-test"),
    ).resolves.toEqual({
      id: 1,
      token: "token-test",
    });
  });

  it("mengembalikan true jika token berhasil dihapus", async () => {
    await expect(
      refreshTokenRepository.deleteByToken("token-test"),
    ).resolves.toBe(true);
  });
});

import type { RefreshTokenRepo } from "../../src/services/auth.service";
import type { JurnalRepo } from "../../src/services/jurnal.service";
import type { PesertaRepo } from "../../src/services/peserta.service";

export type Mocked<T> = { [K in keyof T]: jest.Mock };

function buatMock<T>(nama: ReadonlyArray<keyof T & string>): Mocked<T> {
  const hasil: Record<string, jest.Mock> = {};
  for (const n of nama) hasil[n] = jest.fn();
  return hasil as unknown as Mocked<T>;
}

export const buatMockPesertaRepo = () =>
  buatMock<PesertaRepo>([
    "findAll", "findById", "findBySekolah", "findByFase", "create", "update", "delete",
    "findByEmail", "findPaginated", "findByEmailDenganPassword", "findByIdDenganJurnal",
  ]);

export const buatMockJurnalRepo = () =>
  buatMock<JurnalRepo>([
    "findAll", "findById", "findByPeserta", "findByStatus", "create", "update", "delete",
    "findPaginated",
  ]);

export const buatMockRefreshTokenRepo = () =>
  buatMock<RefreshTokenRepo>(["create", "findByToken", "deleteByToken"]);
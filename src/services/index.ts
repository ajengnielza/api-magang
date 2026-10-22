import { jurnalRepository } from "../repositories/jurnal.repository";
import { pesertaRepository } from "../repositories/peserta.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { AuthService } from "./auth.service";
import { JurnalService } from "./jurnal.service";
import { PesertaService } from "./peserta.service";

// Satu-satunya tempat service dirakit dengan repository asli
export const pesertaService = new PesertaService(pesertaRepository);
export const jurnalService = new JurnalService(jurnalRepository);
export const authService = new AuthService(pesertaRepository, refreshTokenRepository);
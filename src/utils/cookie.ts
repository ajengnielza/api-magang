
import type { CookieOptions, Response } from "express";
import { config } from "../config/env.config";

export const NAMA_COOKIE_REFRESH = "refreshToken";
const TUJUH_HARI_MS = 7 * 24 * 60 * 60 * 1000;

const opsiDasar: CookieOptions = {
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: "strict",
  path: "/api/v1/auth",
};

export function setCookieRefresh(res: Response, token: string): void {
  res.cookie(NAMA_COOKIE_REFRESH, token, {
    ...opsiDasar,
    maxAge: TUJUH_HARI_MS,
  });
}

export function hapusCookieRefresh(res: Response): void {
  res.clearCookie(NAMA_COOKIE_REFRESH, opsiDasar);
}

import rateLimit from "express-rate-limit";
import { AppError } from "../utils/AppError";
import { ErrorCode } from "../utils/errorCodes";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test", // dimatikan saat test, dinyalakan khusus di rate-limit.test.ts
  handler: (_req, _res, next) => {
    next(new AppError("Terlalu banyak percobaan, coba lagi nanti", 429, ErrorCode.RATE_LIMITED));
  },
});
import { Request, Response, NextFunction } from "express";
const requestCounts = new Map<string, { count: number; resetAt: number }>();

const LIMIT = 10;          // maksimal 10 request
const WINDOW_MS = 60_000;  // per 1 menit

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || "unknown";
  const now = Date.now();

  const data = requestCounts.get(ip);

  if (!data || now > data.resetAt) {
    // belum pernah request, atau window sudah lewat → mulai hitungan baru
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  if (data.count >= LIMIT) {
    res.status(429).json({ error: "Too Many Requests, coba lagi nanti" });
    return;
  }

  data.count++;
  next();
}
import { Request, Response, NextFunction } from "express";
import { config } from "../config/env.config";
import { UnauthorizedError, ForbiddenError } from "../utils";

export function cekApiKey(req: Request, _res: Response, next: NextFunction): void {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    throw new UnauthorizedError("API key tidak ditemukan");
  }
  if (apiKey !== config.security.apiKey) {
    throw new ForbiddenError("API key tidak valid");
  }
  next();
}
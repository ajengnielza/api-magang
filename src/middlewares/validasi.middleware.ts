import { Request, RequestHandler } from "express";
import { ClassConstructor } from "class-transformer";
import { validasiDto } from "../utils/validasi.util";
import type { Sumber } from "../utils/validasi.util";

export function validasi<T extends object>(
  dto: ClassConstructor<T>,
  sumber: Sumber = "body"
): RequestHandler {
  return async (req, _res, next) => {
    try {
      const instance = await validasiDto(dto, req[sumber], sumber);
      req.validated = { ...req.validated, [sumber]: instance };
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function ambilDto<T>(req: Request, sumber: Sumber = "body"): T {
  return req.validated?.[sumber] as T;
}
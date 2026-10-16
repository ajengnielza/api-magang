
import { Request, Response, NextFunction, RequestHandler } from "express";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ValidationError, FieldError } from "../utils/AppError";
import { ratakan } from "../utils/validasi.util";

export function validasiPeserta(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const body = req.body ?? {};
  const { nama, sekolah } = body;
  const errors: FieldError[] = [];

  if (!nama || typeof nama !== "string" || nama.trim().length < 3) {
    errors.push({
      field: "nama",
      pesan: "Nama wajib diisi, minimal 3 karakter",
    });
  }

  if (!sekolah || typeof sekolah !== "string") {
    errors.push({
      field: "sekolah",
      pesan: "Sekolah wajib diisi",
    });
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  next();
}

export function validasiBodyWajib(fieldWajib: string[]) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ): void => {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      throw new ValidationError([
        {
          field: "body",
          pesan: "Body request tidak boleh kosong",
        },
      ]);
    }

    const fieldHilang = fieldWajib.filter(
      (field) =>
        req.body[field] === undefined || req.body[field] === ""
    );

    if (fieldHilang.length > 0) {
      const errors: FieldError[] = fieldHilang.map((field) => ({
        field,
        pesan: `${field} wajib diisi`,
      }));

      throw new ValidationError(errors);
    }

    next();
  };
}

export function validasiRegister(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const body = req.body ?? {};
  const { nama, sekolah, email, password } = body;
  const errors: FieldError[] = [];

  if (!nama || typeof nama !== "string" || nama.trim().length < 3) {
    errors.push({
      field: "nama",
      pesan: "Nama wajib diisi, minimal 3 karakter",
    });
  }

  if (!sekolah || typeof sekolah !== "string") {
    errors.push({
      field: "sekolah",
      pesan: "Sekolah wajib diisi",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (typeof email !== "string" || !emailRegex.test(email)) {
    errors.push({
      field: "email",
      pesan: "Format email tidak valid",
    });
  }

  if (
    !password ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    errors.push({
      field: "password",
      pesan: "Password wajib diisi, minimal 8 karakter",
    });
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  next();
}

export function validasiLogin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const body = req.body ?? {};
  const { email, password } = body;
  const errors: FieldError[] = [];

  if (!email || typeof email !== "string") {
    errors.push({
      field: "email",
      pesan: "Email wajib diisi",
    });
  }

  if (!password || typeof password !== "string") {
    errors.push({
      field: "password",
      pesan: "Password wajib diisi",
    });
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  next();
}

type Sumber = "body" | "query" | "params";

export function validasi<T extends object>(
  dto: ClassConstructor<T>,
  sumber: Sumber = "body"
): RequestHandler {
  return async (req, _res, next) => {
    try {
      const mentah: unknown = req[sumber] ?? {};

      if (
        typeof mentah !== "object" ||
        mentah === null ||
        Array.isArray(mentah)
      ) {
        throw new ValidationError([
          {
            field: sumber,
            pesan: `${sumber} harus berupa objek`,
          },
        ]);
      }

      const instance = plainToInstance(
        dto,
        mentah as Record<string, unknown>,
        {
          exposeDefaultValues: true,
        }
      );

      const errors = await validate(instance, {
        whitelist: true,
        forbidNonWhitelisted: sumber === "body",
        validationError: {
          target: false,
          value: false,
        },
      });

      if (errors.length > 0) {
        throw new ValidationError(ratakan(errors));
      }

      req.validated = {
        ...req.validated,
        [sumber]: instance,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function ambilDto<T>(
  req: Request,
  sumber: Sumber = "body"
): T {
  return req.validated?.[sumber] as T;
}

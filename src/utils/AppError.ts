export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Data tidak ditemukan") {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  public detail?: unknown;
  constructor(message: string = "Data tidak valid", detail?: unknown) {
    super(message, 400);
    this.detail = detail;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Tidak diizinkan") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Akses ditolak") {
    super(message, 403);
  }
}
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "../utils/AppError";

const router = Router();

router.get("/not-found", asyncHandler(async () => {
  throw new NotFoundError("Test Data");
}));

router.get("/validation", asyncHandler(async () => {
  throw new ValidationError([
    "nama wajib diisi",
    "email tidak valid",
    "umur harus angka",
  ]);
}));

router.get("/unauthorized", asyncHandler(async () => {
  throw new UnauthorizedError();
}));

router.get("/crash", asyncHandler(async () => {
  throw new Error("Ini error biasa, bukan AppError");
}));

export default router;
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
    { field: "nama", pesan: "nama wajib diisi" },
    { field: "email", pesan: "email tidak valid" },
    { field: "umur", pesan: "umur harus angka" },
  ]);
}));

router.get("/unauthorized", asyncHandler(async () => {
  throw new UnauthorizedError();
}));


export default router;
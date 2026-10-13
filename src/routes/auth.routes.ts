import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validasi } from "../middlewares/validasi.middleware";
import { loginLimiter } from "../middlewares/rateLimiter.middleware";
import { RegisterDto, LoginDto } from "../dto/auth.dto";

const router = Router();

router.post("/register", validasi(RegisterDto), authController.register);
router.post("/login", loginLimiter, validasi(LoginDto), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;
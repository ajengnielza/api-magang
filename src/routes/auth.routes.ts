import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validasiRegister, validasiLogin } from "../middlewares/validasi.middleware";

const router = Router();

router.post("/register", validasiRegister, authController.register);
router.post("/login", validasiLogin, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
import { loginLimiter } from "../middlewares";

router.post("/login", loginLimiter, validasiLogin, authController.login);

export default router;
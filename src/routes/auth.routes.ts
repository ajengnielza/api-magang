import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validasi } from "../middlewares/validasi.middleware";
import { loginLimiter } from "../middlewares/rateLimiter.middleware";
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
} from "../dto/auth.dto";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Registrasi peserta baru
 *     description: Membuat akun peserta baru tanpa access token.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             nama: Budi Santoso
 *             sekolah: SMK 5 Malang
 *             email: budi@example.com
 *             password: Rahasia123
 *             konfirmasiPassword: Rahasia123
 *     responses:
 *       '201':
 *         description: Akun berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PesertaResponse'
 *       '409':
 *         $ref: '#/components/responses/Conflict'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  "/register",
  validasi(RegisterDto),
  authController.register
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login peserta atau mentor
 *     description: Memverifikasi email dan password, lalu mengembalikan access token dan refresh token.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: budi@example.com
 *             password: Rahasia123
 *     responses:
 *       '200':
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *       '429':
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.post(
  "/login",
  loginLimiter,
  validasi(LoginDto),
  authController.login
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Memperbarui access token
 *     description: Menukar refresh token yang valid untuk mendapatkan access token baru.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *           example:
 *             refreshToken: tempel_refresh_token_di_sini
 *     responses:
 *       '200':
 *         description: Access token berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sukses:
 *                   type: boolean
 *                   example: true
 *                 pesan:
 *                   type: string
 *                   example: Berhasil
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: Access token baru
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  "/refresh",
  validasi(RefreshTokenDto),
  authController.refresh
);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout pengguna
 *     description: Menghapus refresh token yang dikirimkan untuk mengakhiri sesi.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *           example:
 *             refreshToken: tempel_refresh_token_di_sini
 *     responses:
 *       '200':
 *         description: Logout berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sukses:
 *                   type: boolean
 *                   example: true
 *                 pesan:
 *                   type: string
 *                   example: Logout berhasil
 *                 data:
 *                   nullable: true
 *                   example: null
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  "/logout",
  validasi(RefreshTokenDto),
  authController.logout
);

export default router;

import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validasi } from "../middlewares/validasi.middleware";
import { loginLimiter } from "../middlewares/rateLimiter.middleware";
import { RegisterDto, LoginDto } from "../dto/auth.dto";

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
router.post("/register", validasi(RegisterDto), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login peserta atau mentor
 *     description: Memverifikasi email dan password. Access token dikembalikan melalui response body, sedangkan refresh token disimpan dalam HttpOnly Cookie.
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
 *         description: Login berhasil. Refresh token dikirim melalui HttpOnly Cookie yang berlaku selama 7 hari.
 *         headers:
 *           Set-Cookie:
 *             description: Cookie refreshToken dengan atribut HttpOnly, SameSite=Strict, Path=/api/v1/auth, dan Max-Age 7 hari.
 *             schema:
 *               type: string
 *               example: refreshToken=token-rahasia; HttpOnly; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800
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
 *     description: Menggunakan refresh token dari HttpOnly Cookie untuk mendapatkan access token baru. Refresh token tidak dikirim melalui request body.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: Access token berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post("/refresh", authController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout pengguna
 *     description: Menghapus refresh token dari database jika tersedia dan menghapus HttpOnly Cookie. Endpoint tetap berhasil meskipun cookie tidak dikirim.
 *     security: []
 *     parameters:
 *       - name: refreshToken
 *         in: cookie
 *         required: false
 *         description: HttpOnly Cookie yang dibuat saat login.
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Logout berhasil. Cookie refreshToken dihapus.
 */
router.post("/logout", authController.logout);

export default router;

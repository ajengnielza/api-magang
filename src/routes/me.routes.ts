
import { Router } from "express";
import { authGuard } from "../middlewares/auth.middleware";
import {
  getProfilSaya,
  ubahProfilSaya,
} from "../controllers/peserta.controller";
import { getJurnalSaya } from "../controllers/jurnal.controller";
import { UpdateProfilDto } from "../dto/peserta.dto";
import { validasi, validasi as validasiMiddleware } from "../middlewares";
import { ListJurnalQueryDto } from "../dto/jurnal.dto";

const router = Router();

/**
 * @openapi
 * /me:
 *   get:
 *     tags: [Profil]
 *     summary: Melihat profil sendiri
 *     description: Mengambil profil berdasarkan identitas pengguna pada access token. Wajib login dan hanya menampilkan profil milik pengguna yang sedang login.
 *     responses:
 *       '200':
 *         description: Profil berhasil diambil
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/", authGuard, getProfilSaya);

/**
 * @openapi
 * /me/jurnal:
 *   get:
 *     tags: [Profil]
 *     summary: Daftar jurnal milik sendiri
 *     description: Berpagination. Identitas peserta diambil dari access token, bukan dari parameter query.
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Order'
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, statusReview]
 *           default: createdAt
 *       - in: query
 *         name: statusReview
 *         schema:
 *           type: string
 *           enum: [belum, disetujui, revisi]
 *     responses:
 *       '200':
 *         description: Jurnal milik pengguna yang sedang login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalListResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */
router.get(
  "/jurnal",
  authGuard,
  validasi(ListJurnalQueryDto, "query"),
  getJurnalSaya
);

/**
 * @openapi
 * /me:
 *   patch:
 *     tags: [Profil]
 *     summary: Mengubah profil sendiri
 *     description: Mengubah data profil pengguna yang sedang login. Hanya field yang dikirim yang diperbarui. Nama dan sekolah harus memenuhi validasi DTO; telepon harus menggunakan format nomor Indonesia yang diterima sistem.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfilRequest'
 *           example:
 *             nama: Ainin Testing
 *             sekolah: SMK Negeri 6 Malang
 *             telepon: "081234567890"
 *     responses:
 *       '200':
 *         description: Profil berhasil diperbarui
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */
router.patch("/", authGuard, validasi(UpdateProfilDto), ubahProfilSaya);

export default router;

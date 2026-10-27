
import { Router } from "express";
import { authGuard } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validasi } from "../middlewares/validasi.middleware";
import { IdParamDto } from "../dto/common.dto";
import {
  CreateJurnalDto,
  ListJurnalQueryDto,
  ReviewJurnalDto,
  UpdateJurnalDto,
} from "../dto/jurnal.dto";
import {
  buatJurnal,
  getJurnalById,
  getSemuaJurnal,
  hapusJurnal,
  updateJurnal,
  updateStatusReview,
} from "../controllers/jurnal.controller";

const router = Router();

/**
 * @openapi
 * /jurnal:
 *   post:
 *     tags: [Jurnal]
 *     summary: Membuat jurnal harian
 *     description: Membuat jurnal untuk peserta yang sedang login.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJurnalRequest'
 *     responses:
 *       '201':
 *         description: Jurnal berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalResponse'
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post("/", authGuard, validasi(CreateJurnalDto), buatJurnal);

/**
 * @openapi
 * /jurnal:
 *   get:
 *     tags: [Jurnal]
 *     summary: Mendapatkan daftar jurnal
 *     description: Hanya mentor yang dapat mengakses daftar jurnal.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, statusReview]
 *       - in: query
 *         name: pesertaId
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: statusReview
 *         schema:
 *           type: string
 *           enum: [belum, disetujui, revisi]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: belumDireview
 *         schema:
 *           type: boolean
 *     responses:
 *       '200':
 *         description: Daftar jurnal berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalListResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/",
  authGuard,
  requireRole("mentor"),
  validasi(ListJurnalQueryDto, "query"),
  getSemuaJurnal
);

/**
 * @openapi
 * /jurnal/{id}/review:
 *   patch:
 *     tags: [Jurnal]
 *     summary: Meninjau jurnal
 *     description: Mentor memperbarui status review jurnal.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewJurnalRequest'
 *     responses:
 *       '200':
 *         description: Status review berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  "/:id/review",
  authGuard,
  requireRole("mentor"),
  validasi(IdParamDto, "params"),
  validasi(ReviewJurnalDto),
  updateStatusReview
);

/**
 * @openapi
 * /jurnal/{id}:
 *   get:
 *     tags: [Jurnal]
 *     summary: Mendapatkan detail jurnal
 *     description: Peserta hanya dapat melihat jurnal miliknya, sedangkan mentor dapat melihat semua jurnal.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       '200':
 *         description: Detail jurnal berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/:id",
  authGuard,
  validasi(IdParamDto, "params"),
  getJurnalById
);

/**
 * @openapi
 * /jurnal/{id}:
 *   patch:
 *     tags: [Jurnal]
 *     summary: Memperbarui jurnal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateJurnalRequest'
 *     responses:
 *       '200':
 *         description: Jurnal berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  "/:id",
  authGuard,
  validasi(IdParamDto, "params"),
  validasi(UpdateJurnalDto),
  updateJurnal
);

/**
 * @openapi
 * /jurnal/{id}:
 *   delete:
 *     tags: [Jurnal]
 *     summary: Menghapus jurnal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       "204":
 *         description: Jurnal berhasil dihapus
 *       "401":
 *         description: Belum login atau token tidak valid
 *       "403":
 *         description: Tidak memiliki hak akses
 *       "404":
 *         description: Jurnal tidak ditemukan
 */
router.delete(
  "/:id",
  authGuard,
  validasi(IdParamDto, "params"),
  hapusJurnal
);

export default router;

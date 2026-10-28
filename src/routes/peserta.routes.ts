
import { Router } from "express";
import { authGuard } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validasi } from "../middlewares/validasi.middleware";
import { IdParamDto } from "../dto/common.dto";
import {
  ListPesertaQueryDto,
  UpdateProfilDto,
} from "../dto/peserta.dto";
import * as pesertaController from "../controllers/peserta.controller";

const router = Router();

/**
 * @openapi
 * /peserta:
 *   get:
 *     tags: [Peserta]
 *     summary: Melihat daftar peserta
 *     description: Mengambil daftar peserta dengan pagination, pencarian, dan filter. Endpoint ini tidak memasang authGuard pada route.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Nomor halaman.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Jumlah data per halaman.
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Urutan data.
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Kata kunci pencarian.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [nama, fase, createdAt]
 *           default: createdAt
 *         description: Kolom pengurutan.
 *       - in: query
 *         name: sekolah
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Filter berdasarkan sekolah.
 *       - in: query
 *         name: fase
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter berdasarkan fase magang.
 *     responses:
 *       '200':
 *         description: Daftar peserta berhasil diambil.
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */
router.get(
  "/",
  validasi(ListPesertaQueryDto, "query"),
  pesertaController.getSemuaPeserta
);

/**
 * @openapi
 * /peserta/{id}:
 *   get:
 *     tags: [Peserta]
 *     summary: Melihat detail peserta
 *     description: Mengambil detail peserta berdasarkan ID. Route ini tidak memasang authGuard.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID peserta.
 *     responses:
 *       '200':
 *         description: Detail peserta berhasil diambil.
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */
router.get(
  "/:id",
  validasi(IdParamDto, "params"),
  pesertaController.getPesertaById
);

/**
 * @openapi
 * /peserta/{id}/jurnal:
 *   get:
 *     tags: [Peserta]
 *     summary: Melihat jurnal peserta
 *     description: Mengambil jurnal berdasarkan ID peserta. Route ini tidak memasang authGuard.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID peserta.
 *     responses:
 *       '200':
 *         description: Jurnal peserta berhasil diambil.
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */
router.get(
  "/:id/jurnal",
  validasi(IdParamDto, "params"),
  pesertaController.getJurnalByPesertaId
);

/**
 * @openapi
 * /peserta/{id}:
 *   patch:
 *     tags: [Peserta]
 *     summary: Memperbarui data peserta
 *     description: Mengubah data peserta berdasarkan ID. Hanya pengguna yang sudah login dengan role mentor yang diizinkan.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID peserta yang akan diubah.
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
 *         description: Data peserta berhasil diperbarui.
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id",
  authGuard,
  requireRole("mentor"),
  validasi(IdParamDto, "params"),
  validasi(UpdateProfilDto),
  pesertaController.updatePeserta
);

/**
 * @openapi
 * /peserta/{id}:
 *   delete:
 *     tags: [Peserta]
 *     summary: Menghapus peserta
 *     description: Menghapus data peserta berdasarkan ID. Hanya pengguna yang sudah login dengan role mentor yang diizinkan.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID peserta yang akan dihapus.
 *     responses:
 *       '200':
 *         description: Peserta berhasil dihapus jika controller mengembalikan status 200.
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id",
  authGuard,
  requireRole("mentor"),
  validasi(IdParamDto, "params"),
  pesertaController.hapusPeserta
);

export default router;

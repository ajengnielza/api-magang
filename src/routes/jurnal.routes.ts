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
 *   get:
 *     tags: [Jurnal]
 *     summary: Daftar semua jurnal (khusus mentor)
 *     description: |
 *       Mengembalikan jurnal seluruh peserta dengan pagination.
 *       - Hanya role `mentor`. Peserta mendapat 403; gunakan `/me/jurnal` untuk jurnal sendiri.
 *       - `from` adalah batas awal tanggal dan `to` adalah batas akhir tanggal (format YYYY-MM-DD).
 *       - Kedua batas tanggal bersifat inklusif; filter mencakup seluruh hari pada tanggal yang dipilih berdasarkan UTC.
 *       - `statusReview` mengalahkan `belumDireview` jika keduanya dikirim.
 *       - `belumDireview=true` berarti status `belum`; `false` berarti selain `belum`.
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
 *         description: "Batas awal tanggal pembuatan, contoh: 2026-09-01"
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         description: "Batas akhir tanggal pembuatan, contoh: 2026-09-30"
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: belumDireview
 *         schema:
 *           type: boolean
 *     responses:
 *       '200':
 *         description: Daftar jurnal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalListResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *   post:
 *     tags: [Jurnal]
 *     summary: Buat jurnal harian baru
 *     description: |
 *       Jurnal otomatis dimiliki pengguna yang login dengan status `belum`.
 *       `pesertaId` tidak boleh dikirim (422).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJurnalRequest'
 *           examples:
 *             sederhana:
 *               summary: Tanpa lampiran
 *               value:
 *                 kegiatan: Belajar unit testing dengan Jest dan Supertest
 *             denganLampiran:
 *               summary: Dengan lampiran tangkapan layar
 *               value:
 *                 kegiatan: Menulis test untuk DTO dan service
 *                 hambatan: Bingung cara mock repository
 *                 linkCommit: https://github.com/budi/api-magang/commit/abc123
 *                 lampiran:
 *                   - url: https://contoh.com/ss1.png
 *                     keterangan: Hasil npm test
 *     responses:
 *       '201':
 *         description: Jurnal berhasil dibuat
 *         headers:
 *           Location:
 *             description: Alamat jurnal baru
 *             schema:
 *               type: string
 *               example: /api/v1/jurnal/12
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '422':
 *         description: Input tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               sukses: false
 *               error:
 *                 kode: VALIDATION_ERROR
 *                 pesan: Validasi gagal
 *                 detail:
 *                   - field: lampiran.1.url
 *                     pesan: URL lampiran tidak valid
 *               requestId: b7a1c9e2-4f6d-4a9b-8d3e-1c2f5a7e9b10
 */

router.post("/", authGuard, validasi(CreateJurnalDto), buatJurnal);
router.get(
  "/",
  authGuard,
  requireRole("mentor"),
  validasi(ListJurnalQueryDto, "query"),
  getSemuaJurnal
);

/**
 * @openapi
 * /jurnal/{id}:
 *   get:
 *     tags: [Jurnal]
 *     summary: Detail satu jurnal
 *     description: |
 *       Peserta hanya bisa melihat jurnal miliknya sendiri. Mentor bisa melihat jurnal peserta.
 *       Peserta yang meminta jurnal orang lain mendapat 403.
 *     parameters:
 *       - $ref: '#/components/parameters/IdPath'
 *     responses:
 *       '200':
 *         description: Data jurnal
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
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *   patch:
 *     tags: [Jurnal]
 *     summary: Ubah jurnal
 *     description: |
 *       Hanya pemilik jurnal atau mentor. Peserta lain mendapat 403.
 *       Yang boleh diubah: `kegiatan`, `hambatan`, `linkCommit`.
 *       Minimal satu field harus diisi.
 *       Lampiran tidak bisa diubah lewat endpoint ini.
 *       Status review diubah lewat `/jurnal/{id}/review` (khusus mentor).
 *     parameters:
 *       - $ref: '#/components/parameters/IdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateJurnalRequest'
 *           examples:
 *             hambatan:
 *               summary: Menambah hambatan
 *               value:
 *                 hambatan: Awalnya bingung cara membuat mock repository
 *     responses:
 *       '200':
 *         description: Jurnal berhasil diubah
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
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *   delete:
 *     tags: [Jurnal]
 *     summary: Hapus jurnal
 *     description: Hanya pemilik jurnal atau mentor. Peserta lain mendapat 403.
 *     parameters:
 *       - $ref: '#/components/parameters/IdPath'
 *     responses:
 *       '204':
 *         description: Jurnal berhasil dihapus (tanpa body)
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */
router.get(
  "/:id",
  authGuard,
  validasi(IdParamDto, "params"),
  getJurnalById
);
router.patch(
  "/:id",
  authGuard,
  validasi(IdParamDto, "params"),
  validasi(UpdateJurnalDto),
  updateJurnal
);
router.delete(
  "/:id",
  authGuard,
  validasi(IdParamDto, "params"),
  hapusJurnal
);

/**
 * @openapi
 * /jurnal/{id}/review:
 *   patch:
 *     tags: [Jurnal]
 *     summary: Ubah status review jurnal (khusus mentor)
 *     description: |
 *       Mentor yang melakukan review tercatat sebagai `reviewerId`.
 *       - `disetujui` atau `revisi`: `catatan` wajib (5 sampai 1000 karakter).
 *       - `belum`: jurnal dikembalikan ke belum direview, catatan mentor dikosongkan.
 *       - Nilai lama `sudah` tidak dikenal lagi (422).
 *     parameters:
 *       - $ref: '#/components/parameters/IdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewJurnalRequest'
 *           examples:
 *             disetujui:
 *               summary: Disetujui dengan catatan
 *               value:
 *                 statusReview: disetujui
 *                 catatan: Sudah bagus, lanjutkan.
 *             revisi:
 *               summary: Perlu revisi
 *               value:
 *                 statusReview: revisi
 *                 catatan: Tolong perjelas bagian hambatan.
 *             belum:
 *               summary: Kembalikan ke belum direview
 *               value:
 *                 statusReview: belum
 *     responses:
 *       '200':
 *         description: Status review berhasil diubah
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
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */
router.patch(
  "/:id/review",
  authGuard,
  requireRole("mentor"),
  validasi(IdParamDto, "params"),
  validasi(ReviewJurnalDto),
  updateStatusReview
);

export default router;
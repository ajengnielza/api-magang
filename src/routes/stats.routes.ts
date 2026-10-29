import { Router } from "express";
import { getStats, getStatsPerPeserta } from "../controllers/stats.controller";

const router = Router();
/**
 * @openapi
 * /stats:
 *   get:
 *     tags: [Statistik]
 *     summary: Ringkasan jumlah peserta dan jurnal
 *     security: []
 *     responses:
 *       '200':
 *         description: Statistik umum
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sukses: { type: boolean, example: true }
 *                 pesan: { type: string, example: Berhasil }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPeserta: { type: integer, example: 25 }
 *                     totalJurnal: { type: integer, example: 120 }
 *                     jurnalBelumDireview: { type: integer, example: 18 }
 *                     rataRataJurnalPerPeserta: { type: number, example: 4.8 }
 */

router.get("/", getStats);

/**
 * @openapi
 * /stats/per-peserta:
 *   get:
 *     tags: [Statistik]
 *     summary: Jumlah jurnal per peserta
 *     description: |
 *       Dihitung dengan GROUP BY. `totalJurnal` bertipe string karena hasil COUNT dari
 *       PostgreSQL berupa bigint yang dikirim sebagai teks.
 *     security: []
 *     responses:
 *       '200':
 *         description: Daftar peserta beserta jumlah jurnalnya
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sukses: { type: boolean, example: true }
 *                 pesan: { type: string, example: Berhasil }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pesertaId: { type: integer, example: 3 }
 *                       totalJurnal: { type: string, example: "7" }
 */
router.get("/per-peserta", getStatsPerPeserta);

export default router;
import swaggerJSDoc from "swagger-jsdoc";
import { isProd } from "../config/env.config";
import { components } from "./components";
import { resolve } from "path";

export const spec = swaggerJSDoc({
  failOnErrors: true, // anotasi YAML rusak = error saat start, bukan peringatan yang terabaikan
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API Magang Batch 4",
      version: "1.0.0",
      description:
        "REST API untuk program magang PT Nawasena Insan Permata.\n\n" +
        "Semua endpoint berada di bawah `/api/v1`. Format response sukses dan error " +
        "seragam; setiap response membawa header `X-Request-Id` untuk pelacakan log.",
    },
    servers: [{ url: "/api/v1", description: "API v1" }],
    tags: [
      { name: "Auth", description: "Registrasi, login, refresh token, logout" },
      { name: "Profil", description: "Data milik pengguna yang sedang login" },
      { name: "Peserta", description: "Pengelolaan data peserta" },
      { name: "Jurnal", description: "Jurnal harian dan proses review mentor" },
      { name: "Sistem", description: "Health check" },
      { name: "Statistik", description: "Ringkasan data" },
    ],
    components: components,
     security: [{ bearerAuth: [] }],
  },
  // Lokasi file yang dipindai untuk mencari komentar @openapi
apis: [
  "./src/routes/*.routes.ts",
],
}) as Record<string, unknown>;
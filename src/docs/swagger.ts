import swaggerJSDoc from "swagger-jsdoc";
import { components } from "./components";

export const spec = swaggerJSDoc({
  failOnErrors: true,

  definition: {
    openapi: "3.0.3",

    info: {
    title: "API Magang Batch 4",
    version: "1.0.0",
    description:
      "REST API untuk program magang PT Nawasena Insan Permata.\n\n" +
      "Semua endpoint berada di bawah `/api/v1`. Format response sukses dan error " +
      "seragam; setiap response membawa header `X-Request-Id` untuk pelacakan log.\n\n" +
      "Akun mentor tidak dibuat melalui API. Untuk development, " +
      "akun mentor dibuat menggunakan perintah `npm run seed:mentor`.",
},
    servers: [
      {
        url: "/api/v1",
        description: "API v1",
      },
    ],

    tags: [
      {
        name: "Auth",
        description: "Registrasi, login, refresh token, logout",
      },
      {
        name: "Profil",
        description: "Data milik pengguna yang sedang login",
      },
      {
        name: "Peserta",
        description: "Pengelolaan data peserta",
      },
      {
        name: "Jurnal",
        description: "Jurnal harian dan proses review mentor",
      },
      {
        name: "Sistem",
        description: "Health check",
      },
      {
        name: "Statistik",
        description: "Ringkasan data",
      },
    ],

    components,

    // Keamanan default untuk endpoint yang membutuhkan login.
    // Endpoint publik harus menambahkan security: [].
    security: [{ bearerAuth: [] }],
  },

  apis: ["./src/routes/*.routes.ts"],
}) as Record<string, unknown>;
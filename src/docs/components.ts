// src/docs/components.ts
import { ErrorCode } from "../utils/errorCodes";
import { bungkusDaftar, bungkusSukses, contohError, ref, responsError } from "./helpers";

export const components = {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Tempel access token dari POST /auth/login (tanpa kata Bearer).",
    },
  },

  parameters: {
    Page:  { name: "page", in: "query", description: "Nomor halaman (mulai 1)",
             schema: { type: "integer", minimum: 1, default: 1 } },
    Limit: { name: "limit", in: "query", description: "Jumlah data per halaman",
             schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
    Order: { name: "order", in: "query", description: "Arah pengurutan",
             schema: { type: "string", enum: ["ASC", "DESC"], default: "DESC" } },
    Q:     { name: "q", in: "query", description: "Kata kunci pencarian",
             schema: { type: "string", maxLength: 100 } },
    IdPath: { name: "id", in: "path", required: true, description: "ID data",
              schema: { type: "integer", minimum: 1 } },
  },

  headers: {
    XRequestId: {
      description: "ID unik request, gunakan saat melapor error agar mudah dilacak di log",
      schema: { type: "string", format: "uuid" },
    },
  },

  schemas: {
    PaginationMeta: {
      type: "object",
      properties: {
        page: { type: "integer", example: 1 },
        limit: { type: "integer", example: 10 },
        total: { type: "integer", example: 42 },
        totalPages: { type: "integer", example: 5 },
        hasNext: { type: "boolean", example: true },
        hasPrev: { type: "boolean", example: false },
      },
    },

    FieldError: {
      type: "object",
      properties: {
        field: { type: "string", example: "email", description: "Nama field; notasi titik untuk objek bersarang (lampiran.1.url)" },
        pesan: { type: "string", example: "Format email tidak valid" },
      },
    },

    ErrorResponse: {
      type: "object",
      properties: {
        sukses: { type: "boolean", example: false },
        error: {
          type: "object",
          required: ["kode", "pesan"],
          properties: {
            // Diambil langsung dari kode aplikasi: otomatis sinkron dengan ErrorCode
            kode: { type: "string", enum: Object.values(ErrorCode) },
            pesan: { type: "string" },
            detail: { type: "array", items: ref("FieldError") },
          },
        },
        requestId: { type: "string", format: "uuid" },
      },
    },

    Peserta: {
      type: "object",
      properties: {
        id: { type: "integer", readOnly: true, example: 1 },
        nama: { type: "string", example: "Budi Santoso" },
        sekolah: { type: "string", example: "SMK 5 Malang" },
        email: { type: "string", format: "email", example: "budi@mail.com" },
        fase: { type: "integer", minimum: 1, maximum: 5, example: 1 },
        status: { type: "string", enum: ["aktif", "lulus", "berhenti"] },
        role: { type: "string", enum: ["peserta", "mentor"] },
        telepon: { type: "string", nullable: true, example: "081234567890" },
        createdAt: { type: "string", format: "date-time", readOnly: true },
      },
    },

    RegisterRequest: {
      type: "object",
      required: ["nama", "sekolah", "email", "password", "konfirmasiPassword"],
      additionalProperties: false,   // setara forbidNonWhitelisted: properti asing ditolak
      properties: {
        nama: { type: "string", minLength: 3, maxLength: 100 },
        sekolah: { type: "string", minLength: 3, maxLength: 100 },
        email: { type: "string", format: "email", description: "Dinormalkan: spasi tepi dibuang, jadi huruf kecil" },
        password: {
          type: "string", format: "password", writeOnly: true,
          minLength: 8, maxLength: 72,
          pattern: "^(?=.*[A-Za-z])(?=.*\\d).+$",
          description: "Wajib mengandung huruf dan angka. Maksimal 72 karakter (batas bcrypt).",
        },
        konfirmasiPassword: { type: "string", format: "password", writeOnly: true, description: "Harus sama dengan password" },
      },
    },

    LoginRequest: {
      type: "object",
      required: ["email", "password"],
      additionalProperties: false,
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", format: "password", writeOnly: true },
      },
    },

    
    RefreshRequest: {
      type: "object",
      required: ["refreshToken"],
      additionalProperties: false,
      properties: {
        refreshToken: {
          type: "string",
          minLength: 1,
          maxLength: 2048,
          description: "Refresh token untuk mendapatkan access token baru",
        },
      },
    },

    UpdateProfilRequest: {
      type: "object",
      additionalProperties: false,
      properties: {
        nama: {
          type: "string",
          minLength: 3,
          maxLength: 100,
        },
        sekolah: {
          type: "string",
          minLength: 3,
          maxLength: 100,
        },
        telepon: {
          type: "string",
          pattern: "^(\\+62|62|0)8[1-9][0-9]{6,10}$",
          description: "Nomor telepon Indonesia",
        },
      },
    },

    Lampiran: {
      type: "object",
      required: ["url"],
      additionalProperties: false,
      properties: {
        url: {
          type: "string",
          format: "uri",
          maxLength: 500,
        },
        keterangan: {
          type: "string",
          maxLength: 200,
        },
      },
    },

    CreateJurnalRequest: {
      type: "object",
      required: ["kegiatan"],
      additionalProperties: false,
      properties: {
        kegiatan: {
          type: "string",
          minLength: 10,
          maxLength: 2000,
        },
        hambatan: {
          type: "string",
          maxLength: 2000,
        },
        linkCommit: {
          type: "string",
          format: "uri",
          maxLength: 500,
        },
        lampiran: {
          type: "array",
          maxItems: 5,
          items: {
            $ref: "#/components/schemas/Lampiran",
          },
        },
      },
    },

    UpdateJurnalRequest: {
      type: "object",
      additionalProperties: false,
      properties: {
        kegiatan: {
          type: "string",
          minLength: 10,
          maxLength: 2000,
        },
        hambatan: {
          type: "string",
          maxLength: 2000,
        },
        linkCommit: {
          type: "string",
          format: "uri",
          maxLength: 500,
        },
      },
    },

    
      ReviewJurnalRequest: {
        type: "object",
        required: ["statusReview"],
        additionalProperties: false,
        properties: {
          statusReview: {
            type: "string",
            enum: ["belum", "disetujui", "revisi"],
            description: "Status review jurnal oleh mentor",
          },
          catatan: {
            type: "string",
            minLength: 5,
            maxLength: 1000,
            description:
              "Catatan mentor. Wajib diisi jika statusReview bukan belum.",
          },
        },
      },

      LampiranResponse: {
        type: "object",
        required: ["url"],
        properties: {
          url: {
            type: "string",
            format: "uri",
          },
          keterangan: {
            type: "string",
            nullable: true,
          },
        },
      },

      Jurnal: {
        type: "object",
        required: [
          "id",
          "pesertaId",
          "kegiatan",
          "statusReview",
          "createdAt",
        ],
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          pesertaId: {
            type: "integer",
            example: 1,
          },
          reviewerId: {
            type: "integer",
            nullable: true,
            example: null,
          },
          kegiatan: {
            type: "string",
            example: "Mempelajari dokumentasi OpenAPI",
          },
          hambatan: {
            type: "string",
            nullable: true,
            example: "Masih memahami struktur schema",
          },
          linkCommit: {
            type: "string",
            format: "uri",
            nullable: true,
          },
          statusReview: {
            type: "string",
            enum: ["belum", "disetujui", "revisi"],
            example: "belum",
          },
          catatanMentor: {
            type: "string",
            nullable: true,
          },
          lampiran: {
            type: "array",
            nullable: true,
            items: {
              $ref: "#/components/schemas/LampiranResponse",
            },
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-10-27T08:00:00.000Z",
          },
        },
      },

      JurnalResponse: bungkusSukses(ref("Jurnal")),

      JurnalListResponse: bungkusDaftar(ref("Jurnal")),

      JurnalListWithTotalResponse: {
        type: "object",
        properties: {
          sukses: {
            type: "boolean",
            example: true,
          },
          pesan: {
            type: "string",
            example: "Berhasil",
          },
          total: {
            type: "integer",
            example: 2,
          },
          data: {
            type: "array",
            items: ref("Jurnal"),
          },
        },
      },

    // Pembungkus: bentuk response sukses
    PesertaResponse: bungkusSukses(ref("Peserta")),
    PesertaListResponse: bungkusDaftar(ref("Peserta")),
    LoginResponse: bungkusSukses({
      type: "object",
      properties: {
        accessToken: { type: "string", description: "Berlaku 15 menit" },
        refreshToken: { type: "string", description: "Berlaku 7 hari, tukarkan di /auth/refresh" },
        peserta: ref("Peserta"),
      },
    }),
  },

  responses: {
    Unauthorized: responsError("Belum login, token tidak valid, atau token kedaluwarsa", {
      tokenHilang: { summary: "Token tidak dikirim", value: contohError("UNAUTHORIZED", "Silakan login terlebih dahulu") },
      tokenKedaluwarsa: { summary: "Access token kedaluwarsa", value: contohError("TOKEN_EXPIRED", "Token sudah kedaluwarsa") },
      tokenPalsu: { summary: "Token tidak valid", value: contohError("INVALID_TOKEN", "Token tidak valid") },
    }),

    Forbidden: responsError("Sudah login, tetapi tidak berhak melakukan aksi ini", {
      bukanMentor: { summary: "Aksi khusus mentor", value: contohError("FORBIDDEN", "Kamu tidak berhak melakukan aksi ini") },
    }),

    NotFound: responsError("Data tidak ditemukan", {
      default: { summary: "Data tidak ada", value: contohError("NOT_FOUND", "Peserta tidak ditemukan") },
    }),

    Conflict: responsError("Bentrok dengan data yang sudah ada", {
      duplikat: { summary: "Nilai unik sudah dipakai", value: contohError("CONFLICT", "Data dengan nilai yang sama sudah ada") },
    }),

    ValidationError: responsError("Input tidak lolos validasi", {
      banyakField: {
        summary: "Beberapa field salah",
        value: contohError("VALIDATION_ERROR", "Validasi gagal", [
          { field: "email", pesan: "Format email tidak valid" },
          { field: "password", pesan: "Password minimal 8 karakter" },
        ]),
      },
      propertiAsing: {
        summary: "Properti yang tidak diizinkan (mass assignment)",
        value: contohError("VALIDATION_ERROR", "Validasi gagal", [
          { field: "role", pesan: "Properti ini tidak diizinkan" },
        ]),
      },
    }),

    TooManyRequests: {
      ...responsError("Terlalu banyak percobaan", {
        default: { summary: "Rate limit terlampaui", value: contohError("RATE_LIMITED", "Terlalu banyak percobaan, coba lagi nanti") },
      }),
    },
  },
};
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
  cookieAuth: {
    type: "apiKey",
    in: "cookie",
    name: "refreshToken",
    description: "Cookie httpOnly yang diset saat login. Tidak bisa dibaca JavaScript.",
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
  required: ["page", "limit", "total", "totalPages", "hasNext", "hasPrev"],
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
    required: ["field", "pesan"],
    properties: {
    field: {
      type: "string",
      example: "email",
      description: "Nama field; notasi titik untuk objek bersarang (lampiran.1.url)",
    },
    pesan: { type: "string", example: "Format email tidak valid" },
  },
},

    ErrorResponse: {
  type: "object",
  required: ["sukses", "error", "requestId"],
  properties: {
    sukses: { type: "boolean", example: false },
    error: {
      type: "object",
      required: ["kode", "pesan"],
      properties: {
        kode: {
          type: "string",
          enum: Object.values(ErrorCode),
        },
        pesan: { type: "string" },
        detail: {
          type: "array",
          items: ref("FieldError"),
        },
        debug: {
          type: "object",
          additionalProperties: true,
          description: "Informasi tambahan yang hanya tersedia di development",
        },
      },
    },
    requestId: { type: "string", format: "uuid" },
  },
},
    Peserta: {
  type: "object",
  required: [
    "id",
    "nama",
    "sekolah",
    "email",
    "fase",
    "status",
    "role",
    "telepon",
    "createdAt",
    "updatedAt",
  ],
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
    updatedAt: { type: "string", format: "date-time", readOnly: true },
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
      properties: {
        url: { type: "string", format: "uri", maxLength: 500, example: "https://contoh.com/screenshot.png" },
        keterangan: { type: "string", maxLength: 200, example: "Hasil npm test" },
      },
    },

    Jurnal: {
  type: "object",
  required: [
    "id",
    "pesertaId",
    "reviewerId",
    "kegiatan",
    "hambatan",
    "linkCommit",
    "statusReview",
    "catatanMentor",
    "lampiran",
    "createdAt",
  ],
  properties: {
    id: { type: "integer", example: 12 },
    pesertaId: { type: "integer", example: 3 },
    reviewerId: {
      type: "integer",
      nullable: true,
      description: "Id mentor yang me-review, null jika belum",
    },
    kegiatan: {
      type: "string",
      example: "Belajar unit testing dengan Jest dan Supertest",
    },
    hambatan: { type: "string", nullable: true },
    linkCommit: { type: "string", nullable: true },
    statusReview: {
      type: "string",
      enum: ["belum", "disetujui", "revisi"],
      example: "belum",
    },
    catatanMentor: {
      type: "string",
      nullable: true,
      description: "Terisi saat status disetujui atau revisi",
    },
    lampiran: {
      type: "array",
      nullable: true,
      items: ref("Lampiran"),
    },
    createdAt: { type: "string", format: "date-time" },
  },
},

    JurnalResponse: {
  type: "object",
  required: ["sukses", "pesan", "data"],
  properties: {
    sukses: { type: "boolean", example: true },
    pesan: { type: "string", example: "Berhasil" },
    data: ref("Jurnal"),
  },
},

JurnalListResponse: {
  type: "object",
  required: ["sukses", "pesan", "data", "meta"],
  properties: {
    sukses: { type: "boolean", example: true },
    pesan: { type: "string", example: "Berhasil" },
    data: {
      type: "array",
      items: ref("Jurnal"),
    },
    meta: ref("PaginationMeta"),
  },
},

    CreateJurnalRequest: {
      type: "object",
      required: ["kegiatan"],
      additionalProperties: false,
      description: "pesertaId TIDAK dikirim lewat body: diambil dari token. Mengirimnya menghasilkan 422.",
      properties: {
        kegiatan: { type: "string", minLength: 10, maxLength: 2000 },
        hambatan: { type: "string", maxLength: 2000 },
        linkCommit: { type: "string", format: "uri", maxLength: 500 },
        lampiran: { type: "array", maxItems: 5, items: { $ref: "#/components/schemas/Lampiran" } },
      },
    },

    UpdateJurnalRequest: {
      type: "object",
      additionalProperties: false,
      minProperties: 1,
      description:
        "Hanya kegiatan, hambatan, dan linkCommit yang boleh diubah. " +
        "Lampiran, pesertaId, dan statusReview tidak bisa diubah lewat endpoint ini (422).",
      properties: {
        kegiatan: { type: "string", minLength: 10, maxLength: 2000 },
        hambatan: { type: "string", maxLength: 2000 },
        linkCommit: { type: "string", format: "uri", maxLength: 500 },
      },
    },

    ReviewJurnalRequest: {
      oneOf: [
        {
          type: "object",
          title: "Disetujui atau perlu revisi (catatan wajib)",
          required: ["statusReview", "catatan"],
          additionalProperties: false,
          properties: {
            statusReview: { type: "string", enum: ["disetujui", "revisi"] },
            catatan: { type: "string", minLength: 5, maxLength: 1000, example: "Sudah bagus, lanjutkan." },
          },
        },
        {
          type: "object",
          title: "Dikembalikan ke belum direview (catatan diabaikan)",
          required: ["statusReview"],
          additionalProperties: false,
          properties: {
            statusReview: { type: "string", enum: ["belum"] },
            catatan: { type: "string", description: "Boleh dikirim, tetapi diabaikan dan catatan mentor dikosongkan" },
          },
        },
      ],
    },

    // Pembungkus: bentuk response sukses
    PesertaResponse: bungkusSukses(ref("Peserta")),
    PesertaListResponse: bungkusDaftar(ref("Peserta")),
    
    LoginResponse: bungkusSukses({
  type: "object",
  required: ["accessToken", "peserta"],
  properties: {
    accessToken: {
      type: "string",
    },
    peserta: {
      $ref: "#/components/schemas/Peserta",
    },
  },
}),

RefreshResponse: bungkusSukses({
  type: "object",
  required: ["accessToken"],
  properties: {
    accessToken: {
      type: "string",
      description: "Access token baru hasil refresh",
    },
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
# API Magang Batch 4

![Test](https://github.com/ajengnielza/api-magang/actions/workflows/test.yml/badge.svg)

REST API untuk program magang PT Nawasena Insan Permata: autentikasi, manajemen peserta, dan jurnal harian beserta proses review mentor.

## Teknologi

Node.js, Express 5, TypeScript, PostgreSQL, TypeORM, JWT (access dan refresh token), class-validator, Jest dan Supertest, Swagger (OpenAPI 3.0.3), GitHub Actions.

## Cara Menjalankan

1. Clone repository dan instal dependency:

   ```bash
   git clone https://github.com/ajengnielza/api-magang.git
   cd api-magang
   npm install
   ```

2. Salin `.env.example` menjadi `.env`, kemudian sesuaikan konfigurasi database dan variabel environment lainnya.

3. Buat database PostgreSQL:

   ```bash
   psql -U postgres -c "CREATE DATABASE magang_db;"
   ```

4. Jalankan migration:

   ```bash
   npm run migration:run
   ```

5. Buat akun mentor untuk development:

   ```bash
   npm run seed:mentor
   ```

6. Jalankan server:

   ```bash
   npm run dev
   ```

   Server berjalan di `http://localhost:3000`.

## Dokumentasi API

Swagger UI: `http://localhost:3000/api/docs/` (aktif di development).

Spesifikasi mentah: `http://localhost:3000/api/docs.json`, juga tersimpan di `docs/openapi.json`.

Untuk memperbarui file spesifikasi setelah mengubah anotasi dokumentasi, jalankan:

```bash
npm run docs:export
```

Akun mentor tidak dibuat melalui API. Untuk development, akun mentor dibuat menggunakan perintah `npm run seed:mentor`.

## Cara Menjalankan Test

Menjalankan seluruh test:

```bash
npm test
```

Menjalankan test secara berurutan:

```bash
npm test -- --runInBand
```

Menjalankan test dokumentasi:

```bash
npx jest tests/unit/docs tests/http/docs --runInBand
```

Menjalankan build TypeScript:

```bash
npm run build
```

## Endpoint Ringkas

Semua endpoint menggunakan prefix `/api/v1`.

| Kelompok | Endpoint | Akses |
|---|---|---|
| Auth | `POST /auth/register`, `/login`, `/refresh`, `/logout` | Publik sesuai kebutuhan autentikasi |
| Profil | `GET` dan `PATCH /me`, `GET /me/jurnal` | Login |
| Peserta | `GET /peserta`, `GET /peserta/{id}`, `PATCH` dan `DELETE` | Sesuai Swagger |
| Jurnal | `POST /jurnal`, `GET /jurnal`, `GET`, `PATCH`, `DELETE /jurnal/{id}`, `PATCH /jurnal/{id}/review` | Login, sebagian khusus mentor |
| Statistik | `GET /stats`, `GET /stats/per-peserta` | Sesuai Swagger |
| Sistem | `GET /health`, `/health/ready` | Publik |

Detail parameter, contoh request, response, autentikasi, dan kemungkinan error tersedia di Swagger UI.

## Keputusan Desain

- **Migration, bukan `synchronize`:** perubahan skema database tercatat, dapat ditinjau, dan dapat dikelola melalui migration.
- **DTO dengan whitelist:** properti yang tidak diizinkan ditolak saat validasi request, sehingga `role` tidak bisa diubah melalui body request.
- **Dependency Injection pada service:** memisahkan ketergantungan antarbagian aplikasi agar logika bisnis lebih mudah diuji.
- **Refresh token disimpan di database:** sesi pengguna dapat dikelola dan dicabut saat logout.
- **Format error dengan kode dan `requestId`:** memudahkan frontend menangani error berdasarkan kode serta membantu pelacakan melalui log.
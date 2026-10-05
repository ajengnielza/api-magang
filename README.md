# Api-magang

API backend untuk sistem magang, dibangun dengan Express + TypeScript + TypeORM + PostgreSQL.

## Setup Database dari Nol

1. Clone repository
   \`\`\`bash
   git clone <url-repo>
   cd Api-magang
   \`\`\`

2. Install dependencies
   \`\`\`bash
   npm install
   \`\`\`

3. Buat file `.env` di root project:
   \`\`\`
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=magang_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=secret-untuk-access-token
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=secret-berbeda-untuk-refresh-token
   JWT_REFRESH_EXPIRES_IN=7d
   \`\`\`

4. Buat database PostgreSQL
   \`\`\`bash
   psql -U postgres -c "CREATE DATABASE magang_db;"
   \`\`\`

5. Jalankan seluruh migration
   \`\`\`bash
   npm run migration:run
   \`\`\`

6. Jalankan server (development)
   \`\`\`bash
   npm run dev
   \`\`\`

Server berjalan di `http://localhost:3000`

## Struktur Endpoint API

### Autentikasi

- `POST /api/auth/register` — daftar akun baru (role default: peserta)

  Request body:
  \`\`\`json
  {
    "nama": "Sakala Pratama",
    "sekolah": "SMK Negeri 1",
    "email": "sakala@test.com",
    "password": "passwordAman123"
  }
  \`\`\`

  Response 201:
  \`\`\`json
  {
    "sukses": true,
    "data": { "id": 1, "nama": "Sakala Pratama", "email": "sakala@test.com", "role": "peserta" }
  }
  \`\`\`

- `POST /api/auth/login` — login, dapat access token & refresh token

  Request body:
  \`\`\`json
  { "email": "sakala@test.com", "password": "passwordAman123" }
  \`\`\`

  Response 200:
  \`\`\`json
  {
    "sukses": true,
    "data": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "peserta": { "id": 1, "nama": "Budi Santoso", "role": "peserta" }
    }
  }
  \`\`\`

- `POST /api/auth/refresh` — tukar refresh token dengan access token baru (tanpa login ulang)

  Request body:
  \`\`\`json
  { "refreshToken": "eyJhbGc..." }
  \`\`\`

  Response 200:
  \`\`\`json
  { "sukses": true, "data": { "accessToken": "eyJhbGc..." } }
  \`\`\`

- `POST /api/auth/logout` — hapus refresh token dari database (mencabut sesi)

  Request body:
  \`\`\`json
  { "refreshToken": "eyJhbGc..." }
  \`\`\`

  Response 200:
  \`\`\`json
  { "sukses": true, "pesan": "Logout berhasil" }
  \`\`\`

**Cara pakai token:** sertakan access token di header pada endpoint yang butuh login:
\`\`\`
Authorization: Bearer <accessToken>
\`\`\`

**Masa berlaku token:**
| Jenis | Durasi | Disimpan di |
|---|---|---|
| Access token | 15 menit | tidak disimpan di server, cukup JWT |
| Refresh token | 7 hari | tabel `refresh_token`, bisa dicabut manual |

### Peserta
- `GET /api/peserta` — daftar semua peserta (bisa difilter `?sekolah=` `&fase=` `&limit=`)
- `GET /api/peserta/:id` — detail satu peserta
- `GET /api/peserta/:id/jurnal` — jurnal milik satu peserta (pakai relasi TypeORM)
- `GET /api/peserta/profil-saya` 🔒 — profil milik sendiri (butuh login)
- `POST /api/peserta` — tambah peserta baru
- `PUT /api/peserta/:id` 🔒 — update peserta (hanya milik sendiri)
- `DELETE /api/peserta/:id` 🔒👑 — hapus peserta (khusus mentor)

### Jurnal
- `GET /api/jurnal` 🔒👑 — daftar semua jurnal, semua peserta (khusus mentor)
- `GET /api/jurnal/saya` 🔒 — jurnal milik sendiri (peserta & mentor)
- `GET /api/jurnal/:id` — detail satu jurnal
- `POST /api/jurnal` 🔒 — tambah jurnal baru
- `PUT /api/jurnal/:id` 🔒 — update jurnal (hanya milik sendiri, kecuali mentor)
- `PATCH /api/jurnal/:id/review` 🔒👑 — ubah status review (khusus mentor)
- `DELETE /api/jurnal/:id` 🔒 — hapus jurnal

> 🔒 = butuh login (header `Authorization: Bearer <accessToken>`)
> 👑 = khusus role `mentor`

### Statistik
- `GET /api/stats` — ringkasan statistik (total peserta, total jurnal, dll)
- `GET /api/stats/per-peserta` — jumlah jurnal per peserta (pakai QueryBuilder + GROUP BY)

## Database

- **ORM:** TypeORM
- **Skema:** dikelola sepenuhnya lewat migration (`synchronize: false`)
- **Relasi:** 
  - Peserta ↔ JurnalHarian (One-to-Many)
  - Peserta ↔ Skill (Many-to-Many, lewat tabel `peserta_skill`)
  - Mentor ↔ JurnalHarian (One-to-Many, sebagai reviewer)
  - Peserta ↔ RefreshToken (One-to-Many, satu akun bisa punya banyak sesi aktif)

## Autentikasi & Otorisasi

- **Autentikasi:** JWT dengan dua jenis token (access & refresh), menggunakan secret berbeda untuk masing-masing (`JWT_SECRET` dan `JWT_REFRESH_SECRET`)
- **Password:** di-hash dengan bcrypt, tidak pernah disimpan dalam bentuk asli
- **Otorisasi:**
  - `authGuard` — memverifikasi access token, mengisi `req.user`
  - `requireRole("mentor")` — membatasi endpoint khusus role tertentu
  - Ownership check — memastikan user hanya bisa mengubah data miliknya sendiri (kecuali mentor)

## Script Migration

\`\`\`bash
npm run migration:generate -- src/migrations/NamaMigration   # generate dari perubahan entity
npm run migration:run                                          # jalankan migration pending
npm run migration:revert                                       # batalkan migration terakhir
\`\`\`

## Refleksi: Kenapa DELETE Harus Idempotent & GET Tidak Boleh Menghapus

DELETE harus idempotent karena menghapus data yang sama berkali-kali seharusnya 
tidak menimbulkan efek berbeda dari menghapusnya sekali — data tersebut sudah 
tidak ada, jadi percobaan hapus berikutnya seharusnya tetap membawa sistem ke 
kondisi akhir yang sama (data tidak ada), bukan menghasilkan error atau efek 
samping tambahan.

GET tidak boleh dipakai untuk menghapus data karena GET dianggap "safe" — 
browser, crawler mesin pencari, dan fitur prefetch bebas memanggil GET kapan 
saja tanpa ada tindakan eksplisit dari pengguna, dengan asumsi aksi itu tidak 
mengubah apapun. Kalau penghapusan dilakukan lewat GET, data bisa terhapus 
secara tidak sengaja hanya karena link-nya di-preview atau di-crawl, tanpa ada 
manusia yang benar-benar bermaksud menghapus.
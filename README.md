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

### Peserta
- `GET /api/peserta` — daftar semua peserta (bisa difilter `?sekolah=` `&fase=` `&limit=`)
- `GET /api/peserta/:id` — detail satu peserta
- `GET /api/peserta/:id/jurnal` — jurnal milik satu peserta (pakai relasi TypeORM)
- `POST /api/peserta` — tambah peserta baru
- `PUT /api/peserta/:id` — update peserta
- `DELETE /api/peserta/:id` — hapus peserta

### Jurnal
- `GET /api/jurnal` — daftar semua jurnal (bisa difilter `?peserta=` `&status=`)
- `GET /api/jurnal/:id` — detail satu jurnal
- `POST /api/jurnal` — tambah jurnal baru
- `PUT /api/jurnal/:id` — update jurnal
- `DELETE /api/jurnal/:id` — hapus jurnal

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

## Script Migration

\`\`\`bash
npm run migration:generate -- src/migrations/NamaMigration   # generate dari perubahan entity
npm run migration:run                                          # jalankan migration pending
npm run migration:revert                                       # batalkan migration terakhir
\`\`\`
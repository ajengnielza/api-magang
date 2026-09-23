# API Magang Batch 4

API sederhana untuk mencatat Peserta magang dan Jurnal kegiatan harian mereka. Data masih in-memory (hilang saat server direstart) — dibangun dengan Express + TypeScript, terhubung ke database PostgreSQL lewat TypeORM.

## Menjalankan

```bash
npm install
cp .env.example .env   # lalu sesuaikan API_KEY jika perlu
npm run dev             # development, auto-restart
# atau
npm run build && npm start   # production
```

Server jalan di `http://localhost:3000`.

## Struktur Folder

```
src/
├── config/        → konfigurasi terpusat (port, api key) dari .env
├── types/         → definisi TypeScript (Peserta, Jurnal, dll)
├── middlewares/   → logger, validasi body, auth x-api-key, error handler
├── controllers/   → terima request, panggil service, kirim response
├── services/      → business logic & validasi (jantung aplikasi)
├── repositories/  → akses data (sekarang in-memory, nanti tinggal ganti ke DB)
├── routes/        → definisi endpoint & middleware per-route
├── app.ts         → konfigurasi Express (tanpa listen, biar bisa ditest)
└── index.ts       → entry point, menjalankan server
```

## Format Response

**Sukses:**
```json
{ "sukses": true, "pesan": "Berhasil", "data": { } }
```

**Error:**
```json
{ "sukses": false, "error": "Pesan error", "detail": { } }
```

## Daftar Endpoint

### Peserta

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/peserta` | Semua peserta. Query: `sekolah`, `fase`, `limit` |
| GET | `/api/peserta/:id` | Detail satu peserta (404 jika tidak ada) |
| GET | `/api/peserta/:id/jurnal` | Semua jurnal milik peserta tsb |
| POST | `/api/peserta` | Tambah peserta (wajib: `nama`, `sekolah`, `fase`) |
| PUT | `/api/peserta/:id` | Update peserta |
| DELETE | `/api/peserta/:id` | Hapus peserta — wajib header `x-api-key` |

### Jurnal

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/jurnal` | Semua jurnal. Query: `peserta`, `status` |
| GET | `/api/jurnal/:id` | Detail satu jurnal |
| POST | `/api/jurnal` | Tambah jurnal (kegiatan min. 10 karakter) |
| PUT | `/api/jurnal/:id` | Update jurnal |
| PATCH | `/api/jurnal/:id/review` | Ubah status review saja (body: `{"status": "disetujui"}`) |
| DELETE | `/api/jurnal/:id` | Hapus jurnal — wajib header `x-api-key` |

### Statistik

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/stats` | `totalPeserta`, `totalJurnal`, `jurnalBelumDireview`, `rataRataJurnalPerPeserta` |

## Contoh Request

```bash
curl -X POST http://localhost:3000/api/peserta \
  -H "Content-Type: application/json" \
  -d '{"nama":"Budi","sekolah":"SMK 1","fase":"F2"}'
```

## Catatan: Apa itu ORM?

ORM itu ibarat "penerjemah" antara kode yang saya tulis (TypeScript) dengan database (PostgreSQL). Jadi saya gak perlu nulis perintah SQL secara manual — cukup nulis kode biasa kayak `pesertaRepository.findOneBy({ id })`, nanti TypeORM yang otomatis mengubahnya jadi query SQL ke database, terus hasilnya dikembalikan lagi dalam bentuk object yang gampang dipakai.

Contoh gampangnya: di project ini ada class `Peserta` dan `Jurnal`. Class ini ditandai pakai `@Entity()` dan `@Column()` biar TypeORM tahu "oh ini mewakili satu tabel di database, dan tiap propertinya itu satu kolom". Jadi saya tinggal kerja pakai object/class biasa, gak perlu mikirin SQL tiap kali butuh ambil atau simpan data.

### Kenapa gak nulis SQL manual aja?

Beberapa alasan kenapa saya lebih memilih pakai ORM daripada nulis SQL sendiri:

- **Gampang typo** — kalau nulis nama tabel/kolom manual sebagai teks biasa, salah ketik baru ketahuan pas program dijalankan, bukan waktu lagi nulis kode.
- **Harus ubah data manual** — hasil dari query SQL biasa itu masih data mentah, jadi harus saya ubah sendiri ke bentuk object yang sesuai. Kalau pakai ORM, ini udah otomatis.
- **Rawan bahaya SQL Injection** — kalau nyambung-nyambungin teks buat bikin query, itu bisa dimanfaatkan orang jahat buat nyusupin perintah berbahaya ke database. ORM udah otomatis ngamanin ini.
- **Kode jadi lebih banyak dan berulang** — tiap mau tambah, ambil, ubah, atau hapus data, saya harus nulis query manual satu-satu. Kalau pakai ORM, tinggal pakai fungsi yang udah disediakan kayak `.find()`, `.save()`, `.delete()`.

Intinya, ORM bikin saya bisa fokus ke logika aplikasi pakai bahasa yang udah familiar (TypeScript), tanpa harus pusing mikirin SQL dan keamanannya setiap saat.

Fungsi Tabel migrations

Tabel migrations digunakan oleh TypeORM untuk mencatat migration yang sudah dijalankan pada database. Setiap kali kita menjalankan migration:run, TypeORM akan menyimpan nama dan waktu migration tersebut ke tabel ini.

Gunanya:

Mengetahui migration mana yang sudah dijalankan.
Mencegah migration yang sama dijalankan berulang kali.
Jika ada migration baru, TypeORM akan menjalankannya karena belum tercatat di tabel.
Saat menggunakan migration:revert, TypeORM akan membatalkan migration terakhir dan menghapus catatannya dari tabel.

Jadi, sederhananya tabel migrations seperti catatan riwayat perubahan database, sehingga TypeORM tahu perubahan mana yang sudah dilakukan dan mana yang belum.
# Hasil Uji Skenario API SiTrack

| Keterangan | Isi |
|---|---|
| Tanggal pengujian | ___ / ___ / 2026 |
| Penguji | ______________________ |
| Versi API | v1 (`/api/v1`) |
| `NODE_ENV` saat uji | development |
| Alat uji | PowerShell (`Invoke-WebRequest`) / Postman |

**Cara mengisi:** jalankan tiap skenario, salin **satu baris** hasilnya (status, kode, pesan) ke kolom *Hasil aktual*, lalu beri tanda ✅ jika sesuai kolom *Diharapkan* atau ❌ jika tidak. Skenario yang gagal dijelaskan di bagian *Temuan*.

---

## Tabel Hasil Uji

| # | Skenario | Request | Diharapkan | Hasil aktual | Lolos? |
|---|---|---|---|---|---|
| 1 | Register berhasil | `POST /auth/register` (email baru) | 201 + header `Location` | ✅ |
| 2 | Register email duplikat | `POST /auth/register` (email sama) | 409 `CONFLICT` | 409 `CONFLICT` "Email sudah terdaftar" | ✅ |
| 3 | Register email format salah | `POST /auth/register` (`email: "bukan-email"`) | 422 `VALIDATION_ERROR`, detail field `email` | ✅ |
| 4 | Login salah 11 kali berturut-turut | `POST /auth/login` x11 (password salah) | percobaan 1-10: 401, percobaan ke-11: 429 `RATE_LIMITED` | ✅ |
| 5 | Akses `/me` tanpa token | `GET /me` | 401 `UNAUTHORIZED` | ✅ |
| 6 | Akses `/me` dengan token expired | `GET /me` + token kedaluwarsa | 401 `TOKEN_EXPIRED` | ✅ |
| 7 | Peserta akses endpoint khusus mentor | `GET /jurnal` + token peserta | 403 `FORBIDDEN` | ✅ |
| 8 | Peserta edit jurnal milik peserta lain | `PATCH /jurnal/:id` + token peserta lain | 403 `FORBIDDEN` | ✅ |
| 9 | Peserta tidak ada | `GET /peserta/9999` | 404 `NOT_FOUND` | ✅ |
| 10 | Body JSON rusak | `POST /auth/register` (JSON terpotong) | 400 `INVALID_JSON` | ✅ |
| 11 | Query aneh, tidak bocor | `GET /peserta?page=0&limit=1000&sortBy=password` | 200, `page`=1, `limit`=100, urut `createdAt`, tanpa field `password` | 200, `meta.page`=1, `meta.limit`=100, urut `createdAt` (id 6 ke 1), tidak ada field `password` | ✅ |
| 12 | Mass assignment | `PATCH /me` dengan `{"role":"mentor"}` | role tidak berubah (12a: 200 dan role tetap `peserta`, 12b: 422) | ✅ |
| 13 | Database mati | `GET /health/ready` saat PostgreSQL dimatikan | `/health` tetap 200, `/health/ready` 503 | ✅ |
| 14 | Graceful shutdown | `Ctrl+C` saat server berjalan | log "Menerima SIGINT" lalu "Server dan koneksi database ditutup dengan rapi" | ✅ |

### Uji Tambahan

| # | Skenario | Request | Diharapkan | Hasil aktual | Lolos? |
|---|---|---|---|---|---|
| T1 | Mentor menghapus peserta | `DELETE /peserta/:id` + token mentor | 204 tanpa body | | |
| T2 | Hapus peserta yang sama kedua kali | `DELETE /peserta/:id` (ulang) | 404 `NOT_FOUND` | | |
| T3 | Peserta menghapus peserta lain | `DELETE /peserta/:id` + token peserta | 403 `FORBIDDEN` | | |
| T4 | Peserta menghapus jurnal milik orang lain | `DELETE /jurnal/:id` + token peserta lain | 403 `FORBIDDEN` | | |

---

## Ringkasan

| Hitungan | Jumlah |
|---|---|
| Skenario utama lolos | ___ / 14 |
| Syarat kelulusan tugas | minimal 12 / 14 |
| Uji tambahan lolos | ___ / 4 |

---

## Temuan (isi jika ada skenario yang gagal)

| # | Skenario | Yang terjadi | Dugaan penyebab | Perbaikan | Sudah diuji ulang? |
|---|---|---|---|---|---|
| | | | | | |

---

## Catatan Pengujian

- Setiap skenario yang membuat data memakai email atau akun baru. Hapus data uji dari database jika perlu.
- Skenario 4 dijalankan **paling akhir**. Setelah selesai, restart server supaya penghitung rate limit kembali nol.
- Skenario 13 dan 14 dijalankan di terminal Administrator (13) dan terminal server (14).
- Field `debug` pada response error hanya muncul saat `NODE_ENV=development`. Di `production` field itu tidak dikirim.

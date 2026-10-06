# Audit Endpoint — Api-magang

| Method | Path | Perlu Login? | Role | Masalah Desain |
|---|---|---|---|---|
| GET | /api/peserta | Tidak | - | - |
| GET | /api/peserta/:id | Tidak | - | - |
| GET | /api/peserta/:id/jurnal | Tidak | - | - |
| GET | /api/peserta/profil-saya | Ya | - | ❌ harusnya `/me`, bukan kata "saya" |
| POST | /api/peserta | Tidak | - | - |
| PUT | /api/peserta/:id | Ya | milik sendiri | - |
| DELETE | /api/peserta/:id | Ya | mentor | - |
| GET | /api/jurnal | Ya | mentor | - |
| GET | /api/jurnal/saya | Ya | - | ❌ harusnya `/me/jurnal` |
| GET | /api/jurnal/:id | Tidak | - | - |
| POST | /api/jurnal | Ya | - | - |
| PUT | /api/jurnal/:id | Ya | milik sendiri/mentor | - |
| PATCH | /api/jurnal/:id/review | Ya | mentor | - |
| DELETE | /api/jurnal/:id | Ya | - | - |
| GET | /api/stats | Tidak | - | - |
| GET | /api/stats/per-peserta | Tidak | - | - |
| POST | /api/auth/register | Tidak | - | - |
| POST | /api/auth/login | Tidak | - | - |
| POST | /api/auth/refresh | Tidak | - | - |
| POST | /api/auth/logout | Tidak | - | - |

## Status Code per Skenario

## Status Code per Skenario

| # | Skenario | Status Code | Terverifikasi |
|---|---|---|---|
| a | Register berhasil | 201 Created | |
| b | Register dengan email yang sudah ada | 409 Conflict | ✅ |
| c | Login dengan password salah | 401 Unauthorized | |
| d | Akses /me tanpa token | 401 Unauthorized | ✅ |
| e | Peserta coba PATCH /jurnal/5/review (khusus mentor) | 403 Forbidden | ✅ |
| f | GET /peserta/9999 (tidak ada) | 404 Not Found | ✅ |
| g | DELETE /peserta/1 berhasil | 204 No Content | |
| h | POST /peserta dengan body JSON rusak | 400 Bad Request | |
| i | POST /peserta dengan email format salah | 422 Unprocessable Entity | |
| j | Database mati saat request masuk | 503 Service Unavailable | |

## Uji Kasus Tepi — Pagination & Query

| Input | Perilaku yang Diharapkan | Hasil Aktual |
|---|---|---|
| ?page=0 | Dianggap page=1 | ✅ 200, meta.page=1 |
| ?page=-5 | Dianggap page=1 | ✅ 200, meta.page=1 |
| ?page=abc | Dianggap page=1 | ✅ 200, meta.page=1 |
| ?limit=1000 | Dipotong jadi 100 | ✅ 200, meta.limit=100 |
| ?limit=0 | Dianggap limit=1 | ✅ 200, meta.limit=1 |
| ?limit=abc | Dianggap limit=10 | ✅ 200, meta.limit=10 |
| ?sortBy=password | Ditolak whitelist, fallback createdAt | ✅ 200, urutan sama dengan default |
| ?sortBy=nama;DROP TABLE peserta | Ditolak whitelist, tabel tidak terhapus | ✅ 200, tabel peserta masih ada (dicek manual via psql) |
| ?q=% | Di-escape jadi literal | ✅ 200, tidak mengembalikan semua data secara tidak wajar |
| ?q=_ | Di-escape jadi literal | ✅ 200, hasil sesuai |
| ?q= (kosong) | Dianggap tidak ada pencarian | ✅ 200, semua data tanpa filter |
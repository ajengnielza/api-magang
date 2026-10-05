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
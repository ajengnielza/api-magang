# Audit Endpoint v1

| Method | Path | Login? | Role | Status code utama |
|---|---|---|---|---|
| POST | /api/v1/auth/register | Tidak | - | 201 (+Location), 409, 422 |
| POST | /api/v1/auth/login | Tidak | - | 200, 401, 422, 429 |
| POST | /api/v1/auth/refresh | Tidak | - | 200, 401 |
| POST | /api/v1/auth/logout | Tidak | - | 200 |
| GET | /api/v1/me | Ya | semua | 200, 401 |
| PATCH | /api/v1/me | Ya | semua | 200, 401, 422 |
| GET | /api/v1/me/jurnal | Ya | semua | 200, 401 |
| GET | /api/v1/peserta | Tidak | - | 200 |
| GET | /api/v1/peserta/:id | Tidak | - | 200, 404 |
| GET | /api/v1/peserta/:id/jurnal | Tidak | - | 200, 404 |
| PATCH | /api/v1/peserta/:id | Ya | pemilik | 200, 401, 403, 404, 422 |
| DELETE | /api/v1/peserta/:id | Ya | mentor | 204, 401, 403, 404, 409 |
| GET | /api/v1/jurnal | Ya | mentor | 200, 401, 403 |
| GET | /api/v1/jurnal/:id | Tidak | - | 200, 404 |
| POST | /api/v1/jurnal | Ya | semua | 201 (+Location), 401, 422 |
| PATCH | /api/v1/jurnal/:id | Ya | pemilik / mentor | 200, 401, 403, 404, 422 |
| PATCH | /api/v1/jurnal/:id/review | Ya | mentor | 200, 401, 403, 404, 422 |
| DELETE | /api/v1/jurnal/:id | Ya | pemilik / mentor | 204, 401, 403, 404 |
| GET | /api/v1/stats | Tidak | - | 200 |
| GET | /api/v1/stats/per-peserta | Tidak | - | 200 |
| GET | /api/v1/health | Tidak | - | 200 |
| GET | /api/v1/health/ready | Tidak | - | 200, 503 |

## Catatan temuan (untuk perbaikan berikutnya)
- GET /jurnal/:id dan /peserta/:id/jurnal belum butuh login, sehingga isi jurnal bisa dibaca siapa saja.
- /stats belum butuh login.
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

## Input per Endpoint (versi DTO)

| Method | Path | Body | Query | Params |
|---|---|---|---|---|
| POST | /auth/register | RegisterDto | - | - |
| POST | /auth/login | LoginDto | - | - |
| POST | /auth/refresh | RefreshTokenDto | - | - |
| POST | /auth/logout | RefreshTokenDto | - | - |
| GET | /me | - | - | - |
| PATCH | /me | UpdateProfilDto | - | - |
| GET | /me/jurnal | - | - | - |
| GET | /peserta | - | ListPesertaQueryDto | - |
| GET | /peserta/:id | - | - | IdParamDto |
| GET | /peserta/:id/jurnal | - | - | IdParamDto |
| PATCH | /peserta/:id | UpdateProfilDto | - | IdParamDto |
| DELETE | /peserta/:id | - | - | IdParamDto |
| GET | /jurnal | - | ListJurnalQueryDto | - |
| POST | /jurnal | CreateJurnalDto | - | - |
| GET | /jurnal/:id | - | - | IdParamDto |
| PATCH | /jurnal/:id | UpdateJurnalDto | - | IdParamDto |
| PATCH | /jurnal/:id/review | ReviewJurnalDto | - | IdParamDto |
| DELETE | /jurnal/:id | - | - | IdParamDto |

Endpoint tanpa input: GET /stats, GET /stats/per-peserta, GET /health, GET /health/ready.

| Method | Path | Test |
|---|---|---|
| POST | /auth/register | kontrak-api, tambahan-api |
| POST | /auth/login | kontrak-api, tambahan-api, rate-limit |
| POST | /auth/refresh | tambahan-api |
| POST | /auth/logout | tambahan-api |
| GET | /me | kontrak-api, tambahan-api |
| PATCH | /me | kontrak-api, tambahan-api |
| GET | /me/jurnal | tambahan-api |
| GET | /peserta | tambahan-api |
| GET | /peserta/:id | kontrak-api |
| GET | /peserta/:id/jurnal | **belum ada** |
| PATCH | /peserta/:id | tambahan-api |
| DELETE | /peserta/:id | tambahan-api |
| GET | /jurnal | kontrak-api, produksi |
| GET | /jurnal/:id | **belum ada** |
| POST | /jurnal | kontrak-api, tambahan-api |
| PATCH | /jurnal/:id | tambahan-api |
| PATCH | /jurnal/:id/review | tambahan-api |
| DELETE | /jurnal/:id | tambahan-api |
| GET | /stats, /stats/per-peserta | **belum ada** (butuh database, Jumat) |
| GET | /health | tambahan-api |
| GET | /health/ready | **belum ada** (butuh database, Jumat) |
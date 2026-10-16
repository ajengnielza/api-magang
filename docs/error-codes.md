| `PAYLOAD_TOO_LARGE` | 413 | Body request melebihi 1 MB | `{ "kode": "PAYLOAD_TOO_LARGE", "pesan": "Ukuran request terlalu besar" }` |

Kasus tambahan untuk `VALIDATION_ERROR` (422):
- Properti asing pada body: `{ "field": "role", "pesan": "Properti ini tidak diizinkan" }`
- Elemen array yang salah: `{ "field": "lampiran.1.url", "pesan": "URL lampiran tidak valid" }`
- Body bukan objek: `{ "field": "body", "pesan": "body harus berupa objek" }`
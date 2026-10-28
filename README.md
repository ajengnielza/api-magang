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

## Cara Melacak Error Lewat Request ID

1. Saat terjadi error, response selalu menyertakan `requestId` di body dan header `X-Request-Id`
2. Salin nilai requestId tersebut
3. Cari baris log server (format JSON) yang memiliki field `requestId` sama persis
4. Baris log itu memuat detail lengkap: method, url, status, kode error, dan stack trace

## Refleksi: Entity vs DTO

Entity menggambarkan bentuk tabel di database, lengkap dengan id, hash password,
role, dan timestamp. DTO menggambarkan bentuk data yang boleh masuk atau keluar
lewat API, dan hanya berisi field yang relevan untuk satu kasus. Entity Peserta
tidak boleh dipakai langsung sebagai body register karena memuat field yang tidak
boleh ditentukan client, seperti role dan id, sehingga client bisa menaikkan hak
aksesnya sendiri. Memisahkan keduanya juga membuat perubahan skema database tidak
langsung merusak kontrak API, dan membuat aturan validasi tiap kasus bisa berbeda.

Project ini menggunakan Express versi 5.2.1. Ada tiga perbedaan Express 4 dan Express 5 yang saya pelajari:

1. **`req.body` bisa bernilai `undefined`**
   Di Express 5, kalau request dikirim tanpa body, `req.body` bisa bernilai `undefined`. Hal ini bisa menyebabkan error saat kode langsung mengambil data seperti email dan password. Karena itu, validasi perlu mengecek apakah body tersedia supaya API tidak mengalami error 500, tetapi memberikan pesan validasi yang sesuai.

2. **`req.query` tidak bisa diubah langsung**
   Di Express 5, `req.query` hanya bisa dibaca dan tidak bisa ditimpa dengan hasil validasi. Jadi, data query yang sudah diperiksa perlu disimpan di tempat lain, misalnya `req.validated`.

3. **Penulisan pola route berubah**
   Express 5 tidak lagi mendukung pola route seperti `/:id(\d+)` untuk membatasi parameter ID harus berupa angka. Karena itu, pengecekan apakah ID berupa angka perlu dilakukan melalui DTO atau proses validasi data.

### Membuktikan Test Bisa Gagal

Saya melakukan dua percobaan dengan sengaja mengubah kode agar menghasilkan kesalahan (*sabotage*).

1. **Pengujian `buatMeta`:** Mengubah kondisi `hasNext` dari `page < totalPages` menjadi `page <= totalPages`. Hasilnya, 4 tes gagal dan 17 tes lolos. Ini membuktikan tes dapat mendeteksi kesalahan pada perhitungan halaman berikutnya.
2. **Pengujian `potongTeks`:** Mengubah kondisi `teks.length <= max` menjadi `teks.length < max`. Hasilnya, 1 tes gagal dan 14 tes lolos. Tes berhasil mendeteksi kesalahan ketika panjang teks sama dengan batas maksimum.

Setelah kedua percobaan, kode dipulihkan ke versi semula dan seluruh tes dijalankan kembali untuk memastikan fungsi bekerja dengan benar.

### Soal 6: Jebakan Async

Saya menguji perilaku assertion async menggunakan Jest. Pada percobaan pertama, tes tanpa `await` menghasilkan `JestAssertionError` karena Promise dari `ambilPeserta(1)` berhasil diselesaikan, padahal assertion mengharapkan Promise ditolak.

Selanjutnya, saya memperbaiki tes dengan menggunakan `async`, `await`, dan `expect.assertions(1)`. Pengujian menggunakan `ambilPeserta(99)` berhasil dengan status PASS karena fungsi menghasilkan error sesuai harapan.

Terakhir, saya menguji kembali dengan mengganti ID `99` menjadi `1` untuk memastikan tes dapat mendeteksi kondisi yang salah. Hasil percobaan tersebut dicatat sebagai bukti bahwa assertion async perlu ditunggu menggunakan `await` agar kegagalannya dilaporkan dengan benar.

Catatan Minggu 15: Test DTO Harus Bisa Gagal

Eksperimen A: Menghapus MaxLength(72) pada password membuat test "password 73 karakter" gagal. Ini membuktikan bahwa test dapat mendeteksi aturan validasi yang hilang.

Eksperimen B: Menghapus MaxLength(100) pada sekolah awalnya tidak membuat test gagal karena batas tersebut belum diuji. Setelah test "sekolah 101 karakter" ditambahkan, penghapusan decorator dapat terdeteksi.

Kesimpulan: Test tidak cukup hanya lulus. Test juga harus mampu mendeteksi ketika aturan validasi yang seharusnya ada dihapus.

## Refleksi Minggu 15: Menguji "Apa" bukan "Bagaimana"

Menguji "apa yang terjadi" berarti memeriksa hasil dan efek pentingnya, misalnya
ConflictError dilempar dan data tidak disimpan. Menguji "bagaimana caranya" berarti
memeriksa langkah internal, misalnya query tepat apa yang dikirim ke repository.

Contoh test saya yang menguji detail berlebihan:
  expect(repo.findByIdDenganJurnal).toHaveBeenCalledWith(1);   // pada getJurnalMilikPeserta
Test ini patah kalau nama method repository diganti, padahal perilaku service sama.

Versi yang lebih sehat memeriksa hasil yang dikembalikan:
  expect(hasil).toEqual({ pesertaId: 1, nama: "Budi", jurnal: [...] });

Pengecualian yang saya pertahankan: expect(repo.save).not.toHaveBeenCalled() saat email
duplikat, karena "tidak menyimpan" adalah efek penting, bukan detail cara kerja.

### Hasil Uji Sabotase

1. **Sabotase role:** Setelah pembatasan role mentor dihapus, test `403 FORBIDDEN jika peserta mengakses daftar jurnal` gagal karena respons menjadi 500, bukan 403. File route kemudian dipulihkan.

2. **Sabotase Response DTO:** Saat serialisasi DTO diubah, test gagal dijalankan karena terjadi kesalahan TypeScript: fungsi `serialisasi` membutuhkan dua argumen. Controller kemudian dipulihkan. Pengujian ini belum membuktikan test keamanan password gagal saat dieksekusi.

3. **Sabotase authGuard:** Setelah error JWT dibungkus ulang menjadi `UNAUTHORIZED`, test `INVALID_TOKEN` dan `TOKEN_EXPIRED` gagal karena kode error tidak sesuai kontrak. Middleware kemudian dipulihkan.

## Cara Menjalankan Test

Prasyarat: Node.js dan PostgreSQL yang berjalan.

1. `npm install`
2. Buat database test: `psql -U postgres -c "CREATE DATABASE magang_test;"`
3. Salin `.env.test.example` menjadi `.env.test`, lalu isi `DB_PASSWORD`

| Perintah | Fungsi |
|---|---|
| `npm test` | Unit test dan test HTTP (tanpa database) |
| `npm run test:int` | Integration test (butuh `magang_test`, menjalankan migration dan TRUNCATE) |
| `npm run test:coverage` | Laporan coverage di `coverage/lcov-report/index.html` |

Pengaman: integration test menolak berjalan jika nama database tidak berakhiran `_test`.

## Cara Menjalankan Test

Prasyarat: Node.js dan PostgreSQL berjalan.

1. Instal dependensi dengan `npm install`.
2. Buat database pengujian bernama `magang_test` jika belum tersedia.
3. Salin `.env.test.example` menjadi `.env.test`, lalu isi konfigurasi database termasuk `DB_PASSWORD`.

| Perintah | Fungsi |
|---|---|
| `npm test` | Menjalankan unit test dan test HTTP. |
| `npm run test:int` | Menjalankan integration test; memerlukan database pengujian dan dapat menjalankan migration serta `TRUNCATE`. |
| `npm run test:coverage` | Menjalankan test dengan laporan coverage. |

**Peringatan:** Jalankan integration test hanya terhadap database khusus pengujian. Pastikan konfigurasi menolak nama database yang tidak berakhiran `_test` sebelum test dijalankan.

## Hasil Sesi Suntik Bug

Sesi Suntik Bug menguji 10 perubahan yang sengaja merusak perilaku aplikasi. Hasil akhir: 10 dari 10 bug terdeteksi. Setelah setiap pengujian, file dipulihkan dan test terkait dijalankan kembali.

## Catatan Coverage

Lengkapi bagian ini berdasarkan laporan `npm run test:coverage` yang sebenarnya:

- File coverage rendah 1: [nama file dan persentase]
- File coverage rendah 2: [nama file dan persentase]
- File coverage rendah 3: [nama file dan persentase]
- File yang mendapat test tambahan: [nama file]
- Hasil akhir coverage statements: [persentase aktual]

## Hasil Sabotase Integrasi

- Sabotase A: [perubahan yang dilakukan, test yang gagal, dan hasil setelah pemulihan]
- Sabotase B: [perubahan yang dilakukan, test yang gagal, dan hasil setelah pemulihan]

## — Dokumen Mentah OpenAPI

File `/api/docs.json` berisi spesifikasi OpenAPI yang menjelaskan
informasi API, base URL, kategori endpoint, dan daftar paths.
Swagger UI membaca spesifikasi tersebut untuk menampilkan dokumentasi
API dalam bentuk halaman interaktif. Jadi, JSON merupakan data
spesifikasi, sedangkan Swagger UI merupakan tampilan visualnya.

## — Uji Jebakan CSP

Saya memindahkan middleware Helmet global sebelum pendaftaran Swagger UI
dan menonaktifkan opsi CSP-bypass pada middleware khusus Swagger.
Setelah halaman dimuat ulang, Swagger UI tetap tampil lengkap dan tidak
ditemukan pesan error pada Console. Hasil pengujian menunjukkan bahwa
tidak terlihat gangguan pada Swagger UI dalam kondisi yang diuji.
Setelah pengujian, konfigurasi dikembalikan seperti semula.

## — OpenAPI dan Swagger

OpenAPI adalah spesifikasi standar untuk menjelaskan struktur dan cara
kerja sebuah API, sedangkan Swagger adalah kumpulan tools untuk membuat,
melihat, dan menguji dokumentasi API berdasarkan spesifikasi tersebut.
Dokumentasi API tetap diperlukan meskipun semua kode ditulis sendiri
agar endpoint, parameter, dan respons lebih mudah dipahami.
Dokumentasi juga membantu developer lain menggunakan API tanpa harus
membaca seluruh kode sumber. Dengan demikian, pengembangan, pengujian,
dan pemeliharaan API menjadi lebih terarah.


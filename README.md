API Magang Batch 4

API sederhana untuk mencatat Peserta magang dan Jurnal kegiatan harian mereka. Data masih in-memory (hilang saat server direstart) — siap disambung ke database sungguhan minggu depan, karena akses data sudah dipisah lewat repositories/.

Menjalankan
bash
npm install
cp .env.example .env   # lalu sesuaikan API_KEY jika perlu
npm run dev             # development, auto-restart
# atau
npm run build && npm start   # production

Server jalan di http://localhost:3000.

Struktur Folder
src/
├── config/        → konfigurasi terpusat (port, api key) dari .env
├── types/         → definisi TypeScript (Peserta, Jurnal, dll)
├── middlewares/    → logger, validasi body, auth x-api-key, error handler
├── controllers/    → terima request, panggil service, kirim response
├── services/       → business logic & validasi (jantung aplikasi)
├── repositories/   → akses data (sekarang in-memory, nanti tinggal ganti ke DB)
├── routes/         → definisi endpoint & middleware per-route
├── app.ts          → konfigurasi Express (tanpa listen, biar bisa ditest)
└── index.ts        → entry point, menjalankan server
Format Response

Sukses:
json
{ "sukses": true, "pesan": "Berhasil", "data": { ... } }

Error:
json
{ "sukses": false, "error": "Pesan error", "detail": { } }

Daftar Endpoint
Peserta
GET	/api/peserta	            Semua peserta. Query: sekolah, fase, limit
GET	/api/peserta/:id	        Detail satu peserta (404 jika tidak ada)
GET	/api/peserta/:id/jurnal	    Semua jurnal milik peserta tsb
POST	/api/peserta	        Tambah peserta (wajib: nama, sekolah, fase)
PUT	/api/peserta/:id	        Update peserta
DELETE	/api/peserta/:id	    Hapus peserta — wajib header x-api-key

Jurnal
GET	/api/jurnal	                Semua jurnal. Query: peserta, status
GET	/api/jurnal/:id	            Detail satu jurnal
POST	/api/jurnal	            Tambah jurnal (kegiatan min. 10 karakter)
PUT	/api/jurnal/:id	            Update jurnal
PATCH	/api/jurnal/:id/review	Ubah status review saja (body: {"status": "disetujui"})
DELETE	/api/jurnal/:id	        Hapus jurnal — wajib header x-api-key

Statistik
GET	/api/stats	                totalPeserta, totalJurnal, 
                                jurnalBelumDireview, rataRataJurnalPerPeserta
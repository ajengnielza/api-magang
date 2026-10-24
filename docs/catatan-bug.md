# Catatan Bug API Magang

| # | Gejala | Penyebab | Perbaikan | Test yang menjaga |
|---|---|---|---|---|
| 1 | Request dengan body lebih dari 1 MB menghasilkan status `500`, seharusnya `413` | Error `entity.too.large` belum diterjemahkan dengan benar oleh `terjemahkanError` | Menambahkan pemetaan `entity.too.large` ke `ErrorCode.PAYLOAD_TOO_LARGE` dengan status HTTP 413 | `413 PAYLOAD_TOO_LARGE untuk body lebih dari 1 MB` |
| 2 | Pemilik jurnal sendiri tidak bisa menghapus jurnal | Kondisi otorisasi pada `JurnalService.delete()` menolak pengguna yang bukan mentor tanpa memeriksa kepemilikan jurnal | Memperbaiki kondisi agar peserta boleh menghapus jurnal miliknya sendiri, sedangkan peserta lain tetap ditolak | Unit test `pemilik boleh menghapus jurnalnya sendiri` dan test kepemilikan jurnal lainnya |
| 3 | Review jurnal gagal dengan error database/FK | `reviewer_id` mengacu pada `mentor.id`, tetapi akun mentor yang tersedia hanya ada di tabel `peserta`; tabel `mentor` belum memiliki data terkait | Menambahkan data mentor yang sesuai ke tabel `mentor` agar referensi foreign key valid | Pengujian review jurnal oleh mentor; hasil setelah perbaikan perlu diverifikasi kembali |
| 4 | Password berisiko tersimpan dalam bentuk teks asli jika proses hashing tidak digunakan | Data password saat registrasi harus melewati fungsi hashing sebelum disimpan | Memastikan `AuthService.register()` memakai `hashPassword()` dan login memverifikasi password menggunakan `cekPassword()` | Unit test `menyimpan HASH dari hashPassword, bukan password asli` |
| 5 | Respons API berisiko membocorkan password peserta | Data entity peserta dapat mengandung properti password jika dikembalikan langsung tanpa serialisasi DTO | Menggunakan `serialisasi(PesertaResponseDto, peserta)` sebelum mengirim respons | Test `password tidak pernah ikut keluar walau service mengembalikannya` |
| 6 | Error JWT kehilangan kode khusus `INVALID_TOKEN` dan `TOKEN_EXPIRED` jika dibungkus ulang sebagai `UNAUTHORIZED` | `try/catch` pada `authGuard` mengubah jenis error JWT menjadi error autentikasi umum | Membiarkan error dari `verifikasiToken(token)` diteruskan agar penanganan error mempertahankan kode sesuai kontrak | `401 INVALID_TOKEN untuk token asal-asalan` dan `401 TOKEN_EXPIRED untuk token kedaluwarsa` |

## Catatan Verifikasi

- Bug nomor 1: perbaikan telah dicatat sebelumnya; test payload lebih dari 1 MB terakhir berhasil.
- Bug nomor 2: kondisi kepemilikan pada `JurnalService.delete()` telah diperbaiki dan unit test jurnal berhasil.
- Bug nomor 3: data mentor telah ditambahkan ke tabel `mentor`; pastikan test review jurnal tetap berhasil.
- Bug nomor 4: implementasi hashing password telah diperiksa dan unit test terakhir lolos.
- Bug nomor 5: test Response DTO terakhir berhasil.
- Bug nomor 6: perubahan pada `authGuard` merupakan **sabotase pengujian**, bukan bukti bahwa kode produksi saat ini masih memiliki bug. Setelah sabotase, file middleware dipulihkan.

# Catatan Bug — Minggu 15

## Hasil Investigasi Bug

| # | Gejala | Penyebab | Perbaikan | Test yang mencegah kembalinya |
|---|---|---|---|---|
| 1 | Pesan error login untuk email tidak terdaftar dan password salah berbeda. | Pesan pada cabang email tidak ditemukan dan password tidak cocok tidak konsisten. | Gunakan pesan `Email atau password salah` pada kedua kondisi agar informasi autentikasi tidak dibedakan. | `tests/unit/services/auth.service.test.ts` — `pesan error email salah dan password salah SAMA persis` |
| 2 | Respons API mengirim properti `password` yang seharusnya tidak ditampilkan. | Opsi `excludeExtraneousValues: true` pada fungsi serialisasi dihilangkan. | Pertahankan `excludeExtraneousValues: true` dan pastikan DTO respons hanya mengekspos properti yang diizinkan. | `tests/http/kontrak-api.test.ts` — `password tidak pernah ikut keluar walau service mengembalikannya` |

## Catatan Sesi Suntik Bug

Sebanyak 10 bug diuji pada sesi Suntik Bug. Berdasarkan hasil pengujian, 10 dari 10 bug berhasil dideteksi setelah Bug 7 dan Bug 9 diuji ulang dengan benar.

Bug yang diuji meliputi pagination, batas limit, validasi DTO, middleware autentikasi dan role, penerjemahan error PostgreSQL, konsistensi pesan login, serialisasi respons, validasi mass assignment, serta penghapusan refresh token saat logout.

File dipulihkan menggunakan `git restore` setelah setiap pengujian. Pengujian ulang menunjukkan file terkait kembali lulus.
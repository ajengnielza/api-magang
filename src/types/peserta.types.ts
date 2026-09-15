export interface Peserta {
  id: number;
  nama: string;
  sekolah: string;
  fase: number;   // ← baru
}

export interface PesertaBody {
  nama: string;
  sekolah: string;
  fase: number;   // ← baru
}
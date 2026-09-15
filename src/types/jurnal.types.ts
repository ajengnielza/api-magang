export interface Jurnal {
  id: number;
  pesertaId: number;
  tanggal: string;
  kegiatan: string;
  status: "belum" | "selesai";
}
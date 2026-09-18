export type StatusJurnal = "belum" | "selesai";
export type StatusReview = "belum" | "disetujui" | "revisi";

export interface Jurnal {
  id: number;
  pesertaId: number;
  tanggal: string;
  kegiatan: string;
  status: StatusJurnal;        // status pengerjaan oleh peserta
  statusReview: StatusReview;  // status review oleh mentor
}
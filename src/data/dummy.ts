import { Peserta } from "../types/peserta.types";
import { Jurnal } from "../types/jurnal.types";

export const dataPeserta: Peserta[] = [
  { id: 1, nama: "Andi", sekolah: "SMK 1", fase: 1 },
  { id: 2, nama: "Budi", sekolah: "SMK 2", fase: 2 },
  { id: 3, nama: "Citra", sekolah: "SMK 3", fase: 1 },
  { id: 4, nama: "Dewi", sekolah: "SMK 4", fase: 2 },
];

export const dataJurnal: Jurnal[] = [
  { id: 1, pesertaId: 1, tanggal: "2024-01-10", kegiatan: "Setup project", status: "selesai", statusReview: "disetujui" },
  { id: 2, pesertaId: 1, tanggal: "2024-01-11", kegiatan: "Belajar routing", status: "belum", statusReview: "belum" },
  { id: 3, pesertaId: 2, tanggal: "2024-01-10", kegiatan: "Review kode", status: "selesai", statusReview: "belum" },
];

export let nextId = 5;
export const increaseNextId = (): number => nextId++;

export let nextJurnalId = 4;
export const increaseNextJurnalId = (): number => nextJurnalId++;
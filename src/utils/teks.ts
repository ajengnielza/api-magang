
const PANJANG_TITIK = 3;

export function potongTeks(teks: string, max: number): string {
  if (max <= 0) return "";
  if (teks.length <= max) return teks;
  if (max <= PANJANG_TITIK) return teks.slice(0, max);

  return teks.slice(0, max - PANJANG_TITIK) + "...";
}
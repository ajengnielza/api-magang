export function pilihField(sumber: unknown, diizinkan: readonly string[]): Record<string, unknown> {
  const hasil: Record<string, unknown> = {};
  if (typeof sumber !== "object" || sumber === null) return hasil;

  for (const kunci of diizinkan) {
    const nilai = (sumber as Record<string, unknown>)[kunci];
    if (nilai !== undefined) hasil[kunci] = nilai;
  }
  return hasil;
}
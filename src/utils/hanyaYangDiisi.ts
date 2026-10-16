export function hanyaYangDiisi<T extends object>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, nilai]) => nilai !== undefined)
  ) as Partial<T>;
}
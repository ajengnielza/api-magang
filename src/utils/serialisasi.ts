import { ClassConstructor, plainToInstance } from "class-transformer";

export function serialisasi<T>(dto: ClassConstructor<T>, data: unknown[]): T[];
export function serialisasi<T>(dto: ClassConstructor<T>, data: unknown): T;
export function serialisasi<T>(dto: ClassConstructor<T>, data: unknown): T | T[] {
  return plainToInstance(dto, data, { excludeExtraneousValues: true }) as T | T[];
}
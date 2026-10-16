import { Expose, Type } from "class-transformer";

export class LampiranResponseDto {
  @Expose() url!: string;
  @Expose() keterangan?: string;
}

export class JurnalResponseDto {
  @Expose() id!: number;
  @Expose() pesertaId!: number;
  @Expose() reviewerId?: number | null;
  @Expose() kegiatan!: string;
  @Expose() hambatan?: string | null;
  @Expose() linkCommit?: string | null;
  @Expose() statusReview!: string;
  @Expose() catatanMentor?: string | null;
  @Expose() @Type(() => LampiranResponseDto) lampiran?: LampiranResponseDto[];
  @Expose() createdAt!: Date;
}
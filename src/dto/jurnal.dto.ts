
import { Type } from "class-transformer";
import {
  ArrayMaxSize, IsArray, IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength, ValidateIf, ValidateNested,
} from "class-validator";
import { ListQueryDto } from "./common.dto";
import { KeBoolean, Trim } from "./decorators/transform";

export const SORT_JURNAL = ["createdAt", "statusReview"] as const;
export const STATUS_REVIEW = ["belum", "disetujui", "revisi"] as const;

export type StatusReviewDto = (typeof STATUS_REVIEW)[number];

export class ListJurnalQueryDto extends ListQueryDto {
  @IsOptional()
  @IsIn(SORT_JURNAL, {
    message: `sortBy harus salah satu dari: ${SORT_JURNAL.join(", ")}`,
  })
  sortBy: (typeof SORT_JURNAL)[number] = "createdAt";

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "pesertaId harus berupa bilangan bulat" })
  @Min(1, { message: "pesertaId minimal 1" })
  @Max(2147483647, { message: "pesertaId terlalu besar" })
  pesertaId?: number;

  @IsOptional()
  @IsIn(STATUS_REVIEW, {
    message: `statusReview harus salah satu dari: ${STATUS_REVIEW.join(", ")}`,
  })
  statusReview?: StatusReviewDto;

  @IsOptional()
  @IsDateString({}, {
    message: "from harus berformat tanggal ISO, contoh 2026-09-01",
  })
  from?: string;

  @IsOptional()
  @IsDateString({}, {
    message: "to harus berformat tanggal ISO, contoh 2026-09-30",
  })
  to?: string;

  @IsOptional()
  @KeBoolean()
  @IsBoolean({ message: "belumDireview harus true atau false" })
  belumDireview?: boolean;
}

export class LampiranDto {
  @IsUrl({}, { message: "URL lampiran tidak valid" })
  @MaxLength(500, {
    message: "URL lampiran maksimal 500 karakter",
  })
  url!: string;

  @IsOptional()
  @IsString({ message: "keterangan harus berupa teks" })
  @MaxLength(200, { message: "keterangan maksimal 200 karakter" })
  keterangan?: string;
}

export class CreateJurnalDto {
  @Trim()
  @IsString({ message: "Kegiatan harus berupa teks" })
  @MinLength(10, { message: "Kegiatan minimal 10 karakter" })
  @MaxLength(2000, { message: "Kegiatan maksimal 2000 karakter" })
  kegiatan!: string;

  @IsOptional()
  @Trim()
  @IsString({ message: "Hambatan harus berupa teks" })
  @MaxLength(2000, { message: "Hambatan maksimal 2000 karakter" })
  hambatan?: string;

  @IsOptional()
  @IsUrl({}, { message: "Link commit harus berupa URL yang valid" })
  @MaxLength(500, {
    message: "Link commit maksimal 500 karakter",
  })
  linkCommit?: string;

  @IsOptional()
  @IsArray({ message: "lampiran harus berupa array" })
  @ArrayMaxSize(5, { message: "Lampiran maksimal 5 item" })
  @ValidateNested({ each: true })
  @Type(() => LampiranDto)
  lampiran?: LampiranDto[];

  // pesertaId SENGAJA tidak ada: diambil dari token
}

export class UpdateJurnalDto {
  @IsOptional()
  @Trim()
  @IsString({ message: "Kegiatan harus berupa teks" })
  @MinLength(10, { message: "Kegiatan minimal 10 karakter" })
  @MaxLength(2000, { message: "Kegiatan maksimal 2000 karakter" })
  kegiatan?: string;

  @IsOptional()
  @Trim()
  @IsString({ message: "Hambatan harus berupa teks" })
  @MaxLength(2000, { message: "Hambatan maksimal 2000 karakter" })
  hambatan?: string;

  @IsOptional()
  @IsUrl({}, { message: "Link commit harus berupa URL yang valid" })
  @MaxLength(500, {
    message: "Link commit maksimal 500 karakter",
  })
  linkCommit?: string;
}

export class ReviewJurnalDto {
  @IsIn(STATUS_REVIEW, {
    message: `statusReview harus salah satu dari: ${STATUS_REVIEW.join(", ")}`,
  })
  statusReview!: StatusReviewDto;

  // Catatan WAJIB kalau jurnal disetujui atau perlu direvisi
  @ValidateIf((o: ReviewJurnalDto) => o.statusReview !== "belum")
  @Trim()
  @IsString({
    message: "Catatan wajib diisi saat jurnal disetujui atau perlu direvisi",
  })
  @MinLength(5, { message: "Catatan minimal 5 karakter" })
  @MaxLength(1000, { message: "Catatan maksimal 1000 karakter" })
  catatan?: string;
}

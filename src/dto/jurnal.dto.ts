import { Type } from "class-transformer";
import {
  IsBoolean, IsDateString, IsIn, IsInt, IsOptional, Max, Min,
} from "class-validator";
import { ListQueryDto } from "./common.dto";
import { KeBoolean } from "./decorators/transform";

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
  @IsDateString({}, { message: "from harus berformat tanggal ISO, contoh 2026-09-01" })
  from?: string;

  @IsOptional()
  @IsDateString({}, { message: "to harus berformat tanggal ISO, contoh 2026-09-30" })
  to?: string;

  @IsOptional()
  @KeBoolean()
  @IsBoolean({ message: "belumDireview harus true atau false" })
  belumDireview?: boolean;
}
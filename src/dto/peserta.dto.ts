import { Type } from "class-transformer";
import {
  IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength,
} from "class-validator";
import { ListQueryDto } from "./common.dto";
import { Trim } from "./decorators/transform";

export const SORT_PESERTA = ["nama", "fase", "createdAt"] as const;

export class UpdateProfilDto {
  @IsOptional()
  @Trim()
  @IsString({ message: "Nama harus berupa teks" })
  @MinLength(3, { message: "Nama minimal 3 karakter" })
  @MaxLength(100, { message: "Nama maksimal 100 karakter" })
  nama?: string;

  @IsOptional()
  @Trim()
  @IsString({ message: "Sekolah harus berupa teks" })
  @MinLength(3, { message: "Sekolah minimal 3 karakter" })
  @MaxLength(100, { message: "Sekolah maksimal 100 karakter" })
  sekolah?: string;

  @IsOptional()
  @Matches(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, {
    message: "Format nomor telepon Indonesia tidak valid",
  })
  telepon?: string;
}

export class ListPesertaQueryDto extends ListQueryDto {
  @IsOptional()
  @IsIn(SORT_PESERTA, {
    message: `sortBy harus salah satu dari: ${SORT_PESERTA.join(", ")}`,
  })
  sortBy: (typeof SORT_PESERTA)[number] = "createdAt";

  @IsOptional()
  @Trim()
  @IsString({ message: "sekolah harus berupa teks" })
  @MaxLength(100, { message: "sekolah maksimal 100 karakter" })
  sekolah?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "fase harus berupa bilangan bulat" })
  @Min(1, { message: "fase minimal 1" })
  @Max(5, { message: "fase maksimal 5" })
  fase?: number;
}
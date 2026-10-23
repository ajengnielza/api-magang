
import { MigrationInterface, QueryRunner } from "typeorm";

export class ReviewerMenujukKePeserta1792731502212
  implements MigrationInterface
{
  name = "ReviewerMenujukKePeserta1792731502212";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kosongkan reviewer lama karena sebelumnya mengarah ke tabel mentor
    await queryRunner.query(
      `UPDATE "jurnal_harian" SET "reviewer_id" = NULL`
    );

    // Hapus foreign key lama yang mengarah ke tabel mentor
    await queryRunner.query(
      `ALTER TABLE "jurnal_harian" DROP CONSTRAINT "FK_0cc121456e18e003f9ea738fe6a"`
    );

    // Buat foreign key baru yang mengarah ke tabel peserta
    await queryRunner.query(
      `ALTER TABLE "jurnal_harian" ADD CONSTRAINT "FK_0cc121456e18e003f9ea738fe6a" FOREIGN KEY ("reviewer_id") REFERENCES "peserta"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key baru
    await queryRunner.query(
      `ALTER TABLE "jurnal_harian" DROP CONSTRAINT "FK_0cc121456e18e003f9ea738fe6a"`
    );

    // Kembalikan foreign key lama ke tabel mentor
    await queryRunner.query(
      `ALTER TABLE "jurnal_harian" ADD CONSTRAINT "FK_0cc121456e18e003f9ea738fe6a" FOREIGN KEY ("reviewer_id") REFERENCES "mentor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}

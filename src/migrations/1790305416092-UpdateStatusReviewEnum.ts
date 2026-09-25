import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStatusReviewEnum1790305416092 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "jurnal_harian_statusreview_enum" RENAME TO "jurnal_harian_statusreview_enum_old"`);
        await queryRunner.query(`CREATE TYPE "jurnal_harian_statusreview_enum" AS ENUM('belum', 'disetujui', 'revisi')`);
        await queryRunner.query(`ALTER TABLE "jurnal_harian" ALTER COLUMN "statusReview" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "jurnal_harian" ALTER COLUMN "statusReview" TYPE "jurnal_harian_statusreview_enum" USING "statusReview"::text::"jurnal_harian_statusreview_enum"`);
        await queryRunner.query(`ALTER TABLE "jurnal_harian" ALTER COLUMN "statusReview" SET DEFAULT 'belum'`);
        await queryRunner.query(`DROP TYPE "jurnal_harian_statusreview_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "jurnal_harian_statusreview_enum" RENAME TO "jurnal_harian_statusreview_enum_old"`);
        await queryRunner.query(`CREATE TYPE "jurnal_harian_statusreview_enum" AS ENUM('belum', 'sudah')`);
        await queryRunner.query(`ALTER TABLE "jurnal_harian" ALTER COLUMN "statusReview" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "jurnal_harian" ALTER COLUMN "statusReview" TYPE "jurnal_harian_statusreview_enum" USING "statusReview"::text::"jurnal_harian_statusreview_enum"`);
        await queryRunner.query(`ALTER TABLE "jurnal_harian" ALTER COLUMN "statusReview" SET DEFAULT 'belum'`);
        await queryRunner.query(`DROP TYPE "jurnal_harian_statusreview_enum_old"`);
    }
}
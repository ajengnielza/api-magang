import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordAndRoleToPeserta1790661055248 implements MigrationInterface {
    name = 'AddPasswordAndRoleToPeserta1790661055248'

    public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`ALTER TABLE "peserta" ADD "password" character varying`);
  await queryRunner.query(`UPDATE "peserta" SET "password" = '$2b$10$placeholder' WHERE "password" IS NULL`);
  await queryRunner.query(`ALTER TABLE "peserta" ALTER COLUMN "password" SET NOT NULL`);
  await queryRunner.query(`ALTER TABLE "peserta" ADD "role" character varying NOT NULL DEFAULT 'peserta'`);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`ALTER TABLE "peserta" DROP COLUMN "role"`);
  await queryRunner.query(`ALTER TABLE "peserta" DROP COLUMN "password"`);
}
}
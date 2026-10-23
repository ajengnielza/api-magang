
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCatatanMentorAndLampiranToJurnal1793000000000
  implements MigrationInterface
{
  name = "AddCatatanMentorAndLampiranToJurnal1793000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "jurnal_harian"
      ADD COLUMN IF NOT EXISTS "catatanMentor" text
    `);

    await queryRunner.query(`
      ALTER TABLE "jurnal_harian"
      ADD COLUMN IF NOT EXISTS "lampiran" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "jurnal_harian"
      DROP COLUMN IF EXISTS "lampiran"
    `);

    await queryRunner.query(`
      ALTER TABLE "jurnal_harian"
      DROP COLUMN IF EXISTS "catatanMentor"
    `);
  }
}

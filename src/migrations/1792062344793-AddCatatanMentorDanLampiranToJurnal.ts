import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCatatanMentorDanLampiranToJurnal1792062344793 implements MigrationInterface {
    name = 'AddCatatanMentorDanLampiranToJurnal1792062344793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jurnal_harian" ADD "catatanMentor" text`);
        await queryRunner.query(`ALTER TABLE "jurnal_harian" ADD "lampiran" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jurnal_harian" DROP COLUMN "lampiran"`);
        await queryRunner.query(`ALTER TABLE "jurnal_harian" DROP COLUMN "catatanMentor"`);
    }

}

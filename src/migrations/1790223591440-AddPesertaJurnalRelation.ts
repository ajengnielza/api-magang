import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPesertaJurnalRelation1790223591440 implements MigrationInterface {
    name = 'AddPesertaJurnalRelation1790223591440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jurnal_harian" ADD "peserta_id" integer`);
        await queryRunner.query(`ALTER TABLE "jurnal_harian" ADD CONSTRAINT "FK_7f20e4df833360c0b09c15f8bc3" FOREIGN KEY ("peserta_id") REFERENCES "peserta"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jurnal_harian" DROP CONSTRAINT "FK_7f20e4df833360c0b09c15f8bc3"`);
        await queryRunner.query(`ALTER TABLE "jurnal_harian" DROP COLUMN "peserta_id"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDuplicatePesertaIdColumn1790226188429 implements MigrationInterface {
    name = 'RemoveDuplicatePesertaIdColumn1790226188429'

public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`ALTER TABLE "jurnal_harian" DROP COLUMN "pesertaId"`);
}
public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`ALTER TABLE "jurnal_harian" ADD "pesertaId" integer NOT NULL`);
}

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTeleponColumnToPeserta1790136972947 implements MigrationInterface {
    name = 'AddTeleponColumnToPeserta1790136972947'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "peserta" ADD "telepon" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "peserta" DROP COLUMN "telepon"`);
    }

}

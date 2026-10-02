import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshTokenEntity1790855451706 implements MigrationInterface {
    name = 'AddRefreshTokenEntity1790855451706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "peserta_id" integer NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_3e8c8601e64f59f56cd38b192d7" FOREIGN KEY ("peserta_id") REFERENCES "peserta"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_3e8c8601e64f59f56cd38b192d7"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
    }

}

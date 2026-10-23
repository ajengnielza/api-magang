import { MigrationInterface, QueryRunner } from "typeorm";

export class RefreshTokenCascadeOnDelete1792745764529 implements MigrationInterface {
    name = 'RefreshTokenCascadeOnDelete1792745764529'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_3e8c8601e64f59f56cd38b192d7"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_3e8c8601e64f59f56cd38b192d7" FOREIGN KEY ("peserta_id") REFERENCES "peserta"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_3e8c8601e64f59f56cd38b192d7"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_3e8c8601e64f59f56cd38b192d7" FOREIGN KEY ("peserta_id") REFERENCES "peserta"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

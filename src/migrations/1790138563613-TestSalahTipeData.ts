import { MigrationInterface, QueryRunner } from "typeorm";

export class TestSalahTipeData1790138563613 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "peserta" ADD "kodeSalah" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "peserta" DROP COLUMN "kodeSalah"`);
    }

}

//Kemampuan revert penting di kerja tim karena kalau ada perubahan skema yang keliru, tim tidak perlu memperbaiki database secara manual satu per satu — cukup jalankan revert untuk mengembalikan skema ke kondisi sebelumnya secara otomatis, konsisten, dan tanpa risiko human error.
import { MigrationInterface, QueryRunner } from "typeorm";

// CATATAN: nama file/class ini kurang tepat — migration ini sebenarnya 
// MENGHAPUS kolom telepon (bukan menambahkan). Dibiarkan apa adanya 
// karena sudah dijalankan dan tercatat di tabel migrations.
export class AddTeleponToPeserta1790136041845 implements MigrationInterface {
    name = 'AddTeleponToPeserta1790136041845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "peserta" DROP COLUMN "telepon"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "peserta" ADD "telepon" character varying`);
    }

}

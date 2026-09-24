import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { JurnalHarian } from "./Jurnal.entity";

@Entity("mentor")
export class Mentor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  nama!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  email!: string;

  @Column({ type: "jsonb" })
  keahlian!: string[];

  @OneToMany(() => JurnalHarian, (jurnal) => jurnal.reviewer)
  jurnalDireview!: JurnalHarian[];
}
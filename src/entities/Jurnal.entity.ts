import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Peserta } from "./Peserta.entity";
import { Mentor } from "./Mentor.entity";

export type StatusReview = "belum" | "sudah";

@Entity("jurnal_harian")
export class JurnalHarian {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Peserta, (peserta) => peserta.jurnalList)
  @JoinColumn({ name: "peserta_id" })
  peserta!: Peserta;

  @Column({ name: "peserta_id" })
  pesertaId!: number;

  @ManyToOne(() => Mentor, (mentor) => mentor.jurnalDireview, { nullable: true })
  @JoinColumn({ name: "reviewer_id" })
  reviewer?: Mentor;

  @Column({ name: "reviewer_id", nullable: true })
  reviewerId?: number;

  @Column({ type: "text" })
  kegiatan!: string;

  @Column({ type: "text", nullable: true })
  hambatan?: string;

  @Column({ type: "varchar", nullable: true })
  linkCommit?: string;

  @Column({ type: "enum", enum: ["belum", "sudah"], default: "belum" })
  statusReview!: StatusReview;

  @CreateDateColumn()
  createdAt!: Date;
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Unique,
} from "typeorm";
import { Student } from "./student.entity";
import { ClassSession } from "./class-session.entity";
import { FileUpload } from "./file-upload.entity";
import { SoftDeleteBaseEntity } from "./softDelete.entity";
import { SessionInstance } from "./class-session-instance.entity";
@Entity("absences")
@Unique(["sessionInstance", "student"])
export class Absence extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  reason!: string;

  @Column({ type: "boolean", nullable: true, default: null })
  status: boolean | null;

  @ManyToOne(() => Student, (student) => student.absences, { nullable: false })
  student!: Student;

  @ManyToOne(
    () => SessionInstance,
    (sessionInstance) => sessionInstance.absences,
    {
      onDelete: "CASCADE",
    }
  )
  sessionInstance!: SessionInstance;

  @ManyToMany(() => FileUpload, (fileUpload) => fileUpload.absences)
  @JoinTable({
    name: "absence_files", 
    joinColumn: { name: "absence_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "file_upload_id", referencedColumnName: "id" },
  })
  files!: FileUpload[];
}


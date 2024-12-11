import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Location } from "./location.entity";
import { Parent } from "./parent.entity";
import { Topic } from "./topic.entity";
import { Absence } from "./absence.entity";
import { SessionReport } from "./session-report.entity";
import { Invoice } from "./invoice.entity";
import { ContractPackage } from "./contractPackage.entity";
import { SchoolType } from "./schoolType.entity";
import { StudentExam } from "./studentExam.entity";
import { SoftDeleteBaseEntity } from "./softDelete.entity";
import { SessionInstance } from "./class-session-instance.entity";
@Entity("students")
@Unique(["user"])
export class Student extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  status!: string;

  @Column()
  gradeLevel!: number;

  @Column({ nullable: true })
  contractEndDate!: Date;

  @Column({ nullable: true })
  notes!: string;

  @Column({ type: "varchar", length: 7, default: "0000000" })
  availableDates!: string;

  @Column({ nullable: true })
  sessionBalance!: number;

  @ManyToOne(() => User, (user) => user.students, { nullable: true })
  user!: User;

  @ManyToMany(() => Location, (location) => location.students)
  @JoinTable({
    name: "locations_students_students",
    joinColumn: { name: "studentId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "locationId", referencedColumnName: "id" },
  })
  locations!: Location[];

  @OneToMany(() => StudentExam, (exam) => exam.student, { nullable: true })
  exams!: StudentExam[];

  @ManyToOne(() => Parent, (parent) => parent.students, { nullable: true })
  parent!: Parent;

  @ManyToOne(() => ContractPackage, (contract) => contract.students, {
    nullable: true,
  })
  contract: ContractPackage | null;

  @ManyToMany(() => Topic, (topic) => topic.students)
  @JoinTable({
    name: "students_topics_topics",
    joinColumn: { name: "studentsId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "topicsId", referencedColumnName: "id" },
  })
  topics!: Topic[];

  @OneToMany(() => Invoice, (invoice) => invoice.student, { nullable: true })
  invoices!: Invoice[];

  @ManyToOne(() => SchoolType, (schoolType) => schoolType.students, {
    nullable: true,
  })
  schoolType!: SchoolType;

  @OneToMany(() => Absence, (absence) => absence.student)
  absences!: Absence[];

  @OneToMany(() => SessionReport, (sessionReport) => sessionReport.student)
  sessionReports!: SessionReport[];

  @ManyToMany(
    () => SessionInstance,
    (sessionInstance) => sessionInstance.students
  )
  sessionInstances!: SessionInstance[];
}

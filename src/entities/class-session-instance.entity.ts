import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { ClassSession } from "./class-session.entity";
import { Absence } from "./absence.entity";
import { Teacher } from "./teacher.entity";
import { Location } from "./location.entity";
import { Student } from "./student.entity";
import { SoftDeleteBaseEntity } from "./softDelete.entity";
import { SessionType } from "./sessionType.entity";

@Entity("class_session_instances")
export class SessionInstance extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "date" })
  date!: Date;

  @Column({ type: "text", nullable: true })
  room!: string;

  @Column({ type: "time", nullable: true })
  startTime!: string;
  
  @Column({  nullable: true })
  reportsSubmitted!: boolean;

  @Column({ type: "integer", nullable: true })
  duration?: number;

  @OneToMany(() => Absence, (absence) => absence.sessionInstance)
  absences!: Absence[];

  @ManyToOne(() => ClassSession, (classSession) => classSession.instances, {
    onDelete: "CASCADE",
  })
  classSession!: ClassSession;

  @ManyToOne(() => Teacher, (teacher) => teacher.sessionInstances, {
    nullable: true,
  })
  teacher!: Teacher;

  @ManyToMany(() => Student, (student) => student.sessionInstances)
  @JoinTable({
    name: "class_sessions_instance_students",
    joinColumn: { name: "sessionInstancesId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "studentsId", referencedColumnName: "id" },
  })
  students!: Student[];

  @ManyToOne(() => SessionType, (sessionType) => sessionType.sessionInstances)
  sessionType!: SessionType;

  @ManyToOne(() => Location, (location) => location.sessionInstances, {
    nullable: true,
  })
  location!: Location;

  @Column({ type: "text", nullable: true })
  note!: string;

  @Column({ default: true })
  isActive!: boolean;
}


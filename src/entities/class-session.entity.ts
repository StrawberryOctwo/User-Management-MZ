import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Topic } from "./topic.entity";
import { SoftDeleteBaseEntity } from "./softDelete.entity";
import { SessionInstance } from "./class-session-instance.entity";

@Entity("class_sessions")
export class ClassSession extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => SessionInstance, (instance) => instance.classSession)
  instances!: SessionInstance[];

  @Column({ nullable: true })
  recurrencePattern!: string;

  @Column({ type: "date" })
  startDate!: Date;

  @Column({ type: "date" })
  endDate!: Date;

  @Column({ default: false })
  isHolidayCourse!: boolean;

  @ManyToOne(() => Topic, (topic) => topic.classSessions, { nullable: true })
  topic!: Topic;
}


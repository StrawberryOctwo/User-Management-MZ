import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  OneToMany,
  JoinTable,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from "typeorm";
import { User } from "./user.entity";
import { Topic } from "./topic.entity";
import { Location } from "./location.entity";
import { ClassSession } from "./class-session.entity";
import { Availability } from "./availability.entity";
import { SessionInstance } from "./class-session-instance.entity";

import { SoftDeleteBaseEntity } from './softDelete.entity';

@Entity('teachers')
@Unique(['employeeNumber', 'idNumber'])
export class Teacher extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  employeeNumber!: string;

  @Column({ nullable: true })
  idNumber!: string;

  @Column({ nullable: true })
  taxNumber!: string;

  @Column({ nullable: true })
  contractStartDate!: Date;

  @Column({ nullable: true })
  contractEndDate!: Date;

  @Column()
  hourlyRate!: number;

  @Column({ type: "decimal", default: 1.0 })
  rateMultiplier!: number; 

  @Column({ type: 'int', default: 1 })
  invoiceDay!: number;
  

  @Column()
  bank!: string;

  @Column()
  iban!: string;

  @Column({ nullable: true })
  bic!: string;

  @Column({ nullable: true })
  status!: string;

  @ManyToOne(() => User, (user) => user.teachers)
  user!: User;

  @ManyToMany(() => Topic, (topic) => topic.teachers)
  @JoinTable({
    name: "teachers_topics_topics",
    joinColumn: { name: "teachersId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "topicsId", referencedColumnName: "id" },
  })
  topics!: Topic[];

  @OneToMany(() => Availability, (availability) => availability.teacher, {
    nullable: true,
  })
  availabilities!: Availability[];

  @OneToMany(
    () => SessionInstance,
    (sessionInstance) => sessionInstance.teacher
  )
  sessionInstances!: SessionInstance[];

  @ManyToMany(() => Location, (location) => location.teachers)
  @JoinTable({
    name: "locations_teachers_teachers",
    joinColumn: { name: "teacherId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "locationId", referencedColumnName: "id" },
  })
  locations!: Location[];




}


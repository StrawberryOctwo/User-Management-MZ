import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Teacher } from './teacher.entity';
import { Student } from './student.entity';
import { ClassSession } from './class-session.entity';
import { Franchise } from './franchise.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';

@Entity('topics')
export class Topic extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToMany(() => Teacher, (teacher) => teacher.topics)
  teachers!: Teacher[];

  @ManyToMany(() => Student, (student) => student.topics)
  students!: Student[];

  @ManyToOne(() => Franchise, (franchise) => franchise.topics)
  franchise!: Franchise;

  @ManyToMany(() => ClassSession)
  classSessions!: ClassSession[];




}


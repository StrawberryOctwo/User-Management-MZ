import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Student } from './student.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';

@Entity('student_exams')
export class StudentExam extends SoftDeleteBaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  name!: string; 

  @Column({ type: "varchar" })
  grade!: string; 

  @ManyToOne(() => Student, (student) => student.exams, { nullable: true })
  student!: Student; 
}


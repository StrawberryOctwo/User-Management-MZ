import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Student } from './student.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';
import { SessionInstance } from './class-session-instance.entity';
@Entity('session_reports')
export class SessionReport extends SoftDeleteBaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  lessonTopic!: string;

  @Column({ nullable: true })
  coveredMaterials!: string;

  @Column({ nullable: true })
  progress!: string; 

  @Column({ nullable: true, type: 'text' })
  learningAssessment!: string; 

  @Column({ default: false })
  activeParticipation!: boolean; 

  @Column({ default: false })
  concentration!: boolean; 

  @Column({ default: false })
  worksIndependently!: boolean; 

  @Column({ default: false })
  cooperation!: boolean; 

  @Column({ default: false })
  previousHomeworkCompleted!: boolean; 

  @Column({ nullable: true })
  nextHomework!: string; 

  @Column({ nullable: true, type: 'text' })
  tutorRemarks!: string; 



  @ManyToOne(() => SessionInstance, (classSession) => classSession.id)
  session!: SessionInstance;

  @ManyToOne(() => Student, (student) => student.sessionReports)
  student!: Student;




}


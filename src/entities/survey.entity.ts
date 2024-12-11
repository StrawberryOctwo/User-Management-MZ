import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Question } from './question.entity';
import { UserSurvey } from './userSurvey.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';

@Entity('surveys')
export class Survey extends SoftDeleteBaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  title!: string; 

  @OneToMany(() => Question, (question) => question.survey, { cascade: true })
  questions!: Question[]; 

  @OneToMany(() => UserSurvey, (userSurvey) => userSurvey.survey)
  userSurveys!: UserSurvey[]; 


}


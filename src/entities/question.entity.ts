import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

import { Answer } from './answer.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';
import { Survey } from './survey.entity';
@Entity('questions')
export class Question extends SoftDeleteBaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  text!: string; 

  @Column({ type: 'varchar' })
  type!: string; 

  @Column({ type: 'simple-array', nullable: true })
  options?: string[]; 

  @ManyToOne(() => Survey, (survey) => survey.questions, { onDelete: 'CASCADE' })
  survey!: Survey; 

  @OneToMany(() => Answer, (answer) => answer.question, { cascade: true })
  answers!: Answer[]; 
}


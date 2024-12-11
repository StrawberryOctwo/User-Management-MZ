import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Question } from './question.entity';
import { User } from './user.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';
@Entity('answers')
export class Answer extends SoftDeleteBaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', nullable: true })
  text!: string | null; 

  @Column({ type: 'simple-array', nullable: true })
  selectedOptions?: string[]; 

  @ManyToOne(() => Question, (question) => question.answers, { onDelete: 'CASCADE' })
  question!: Question; 

  @ManyToOne(() => User, { nullable: true })
  user!: User | null; 
}


import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from './user.entity';
import { Survey } from './survey.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';

@Entity('user_surveys')
export class UserSurvey extends SoftDeleteBaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.userSurveys, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Survey, (survey) => survey.userSurveys, { onDelete: 'CASCADE' })
  survey!: Survey;

  @Column({ type: 'varchar', default: 'pending' }) 
  status!: 'completed' | 'skipped' | 'pending';
}


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { ToDoAssignee } from './todoAssignee.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';


@Entity('todos')
export class ToDo extends SoftDeleteBaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate!: Date;

  @Column({ type: 'enum', enum: ['Low', 'Medium', 'High'], default: 'Medium' })
  priority!: 'Low' | 'Medium' | 'High';

  @Column({ nullable: true })
  assignedRoles!: string; 

  @ManyToOne(() => User, { nullable: true })
  assignedBy!: User;

  @OneToMany(() => ToDoAssignee, (todoAssignee) => todoAssignee.todo, { cascade: true })
  assignees!: ToDoAssignee[]; 




}


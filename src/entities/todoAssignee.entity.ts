import { Entity, ManyToOne, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { ToDo } from './todo.entity';
import { User } from './user.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';


@Unique(['user','todo'])
@Entity('todo_assignees')
export class ToDoAssignee extends SoftDeleteBaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ToDo, (todo) => todo.assignees, { onDelete: 'CASCADE' })
  todo!: ToDo;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ default: false })
  completed!: boolean; 
}


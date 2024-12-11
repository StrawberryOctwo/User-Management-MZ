

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Teacher } from './teacher.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';
@Entity('availabilities')
export class Availability extends SoftDeleteBaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  dayOfWeek!: string; 

  @Column({ type: 'time', default: '09:00' })
  startTime!: string;
  
  @Column({ type: 'time', default: '17:00' })
  endTime!: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.availabilities, { nullable:true })
  teacher!: Teacher;
}


import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Student } from './student.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';
@Entity('schoolTypes')
export class SchoolType extends SoftDeleteBaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => Student, (student) => student.schoolType)
  students!: Student[]; 
}

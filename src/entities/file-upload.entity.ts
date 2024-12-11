import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { User } from './user.entity';
import { Absence } from './absence.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';
@Entity('file_uploads')
export class FileUpload extends SoftDeleteBaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  type!: string;

  @Column()
  name!: string;

  @Column()
  path!: string;



  @ManyToOne(() => User, (user) => user.files, { nullable: true })
  user!: User;

  @ManyToMany(() => Absence, (absence) => absence.files, { nullable: true })
  absences!: Absence[];




}


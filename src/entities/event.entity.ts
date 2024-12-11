import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Location } from './location.entity';
import { User } from './user.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';
@Entity('events')
export class Event extends SoftDeleteBaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  startDateTime!: Date;

  @Column()
  endDateTime!: Date;

  @Column({ default: false })
  isAllDay!: boolean;

  @Column({ default: false })
  isCompleted!: boolean;


  
  @ManyToMany(() => Location)
  @JoinTable({
    name: 'events_locations_locations',
    joinColumn: { name: 'eventsId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'locationsId', referencedColumnName: 'id' },
  })
  locations!: Location[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'events_specific_users_users',
    joinColumn: { name: 'eventsId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'usersId', referencedColumnName: 'id' },
  })
  specificUsers!: User[];




}


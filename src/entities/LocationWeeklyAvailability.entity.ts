import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Location } from './location.entity';

@Entity('location_weekly_availabilities')
export class LocationWeeklyAvailability {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Location, (location) => location.id, {
    nullable: false,
    eager: true,
  })
  location!: Location;

  @Column({ type: 'varchar' })
  dayOfWeek!: string; 

  @Column({ type: 'time' })
  startTime!: string; 

  @Column({ type: 'time' })
  endTime!: string; 

  @Column({ type: 'int' })
  capacityPerSlot!: number; 
}


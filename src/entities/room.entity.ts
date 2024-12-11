import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Location } from './location.entity';

@Entity('rooms')
export class Room {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ nullable: true })
    capacity!: number; 

    @ManyToOne(() => Location, (location) => location.rooms, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    location!: Location;
}


import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Location } from './location.entity';

@Entity('interests')
export class Interest {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column()
  phoneNumber!: string;

  @ManyToOne(() => Location, (location) => location.id, {
    nullable: false,
    eager: true,
  })
  location!: Location;

  @Column()
  role!: string;


  @Column({default : false})
  accepted!: boolean;

  @Column()
  fundingOption!: string;

  @Column({ type: 'boolean', default: false })
  takeKnowledgeTest!: boolean;

  @Column({ type: 'timestamp' ,nullable: true })
  appointment!: Date;

  @Column({ type: 'json', nullable: true })
  documents!: { name: string; path: string }[]; 

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}


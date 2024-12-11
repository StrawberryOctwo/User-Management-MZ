import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Franchise } from "./franchise.entity";
import { SoftDeleteBaseEntity } from './softDelete.entity';
@Entity('billings')
export class Billing extends SoftDeleteBaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  revenue!: number; 

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountDue!: number;

  @Column()
  isPaid!: boolean;

  @ManyToOne(() => Franchise, (franchise) => franchise.billings)
  franchise!: Franchise;

  @CreateDateColumn({ type: 'timestamp' })
  billingDate!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  paymentDate?: Date; 
}


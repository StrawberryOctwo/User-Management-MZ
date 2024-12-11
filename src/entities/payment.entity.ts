import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique  } from 'typeorm';
import { ClassSession } from './class-session.entity';
import { User } from './user.entity';
import { Invoice } from './invoice.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';
import { SessionInstance } from './class-session-instance.entity';
@Entity('payments')
@Unique(['user', 'session'])  
export class Payment extends SoftDeleteBaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Column({ type: 'decimal', precision: 10, scale: 2 ,nullable: true })
  amount!: number;

  @Column()
  paymentStatus!: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.payments, { nullable: true })
  invoice!: Invoice;
  
  @Column()
  paymentDate!: Date;

  @Column()
  lastUpdate!: Date;

  @ManyToOne(() => SessionInstance, (classSession) => classSession.id, { nullable: true })
  session!: SessionInstance;

  @ManyToOne(() => User, (user) => user.payments, { nullable: true })
  user!: User;




}


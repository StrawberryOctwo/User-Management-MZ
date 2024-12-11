import { AppDataSource } from '../config/data-source';
import { BeforeInsert, Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Student } from './student.entity';
import { Payment } from './payment.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';
@Entity('invoices')
export class Invoice extends SoftDeleteBaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  invoiceId!: number; 

  @ManyToOne(() => User, (user) => user.invoices, { nullable: false })
  user!: User;
  
  @ManyToOne(() => Student, (student) => student.invoices, { nullable: true })
  student!: Student;

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments!: Payment[];
  
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'decimal', nullable: true })
  monthlyFee: number;

  @Column({ type: 'decimal', nullable: true })
  oneTimeFee: number;

  @Column({ default: 'Pending' })
  status!: string;





  @BeforeInsert()
  async generateInvoiceId() {
    const invoiceRepository = AppDataSource.getRepository(Invoice);

    
    const lastUserInvoice = await invoiceRepository.findOne({
      where: { user: { id: this.user.id } },
      order: { invoiceId: 'DESC' },
    });

    
    this.invoiceId = lastUserInvoice ? lastUserInvoice.invoiceId + 1 : 1;
  }
}


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Student } from "./student.entity";
import { User } from "./user.entity";
import { SoftDeleteBaseEntity } from "./softDelete.entity";
import { Franchise } from "./franchise.entity";
@Entity("parents")
export class Parent extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  accountHolder!: string;

  @Column()
  iban!: string;

  @ManyToOne(() => User, (user) => user.parents, { nullable: true })
  user!: User;

  @Column({ nullable: true })
  bic!: string;

  @Column({ type: "int", default: 1 })
  invoiceDay!: number;

  @OneToMany(() => Student, (student) => student.parent)
  students!: Student[];
}

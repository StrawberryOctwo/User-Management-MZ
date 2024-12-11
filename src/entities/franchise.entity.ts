import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
} from "typeorm";
import { User } from "./user.entity";
import { Location } from "./location.entity";
import { Topic } from "./topic.entity";
import { Billing } from "./billing.entity";
import { ContractPackage } from "./contractPackage.entity";
import { SoftDeleteBaseEntity } from "./softDelete.entity";
import { Parent } from "./parent.entity";

@Entity("franchises")
export class Franchise extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  ownerName!: string;

  @Column()
  cardHolderName!: string;

  @Column({ default: false })
  public!: boolean;

  @Column()
  iban!: string;

  @Column()
  bic!: string;

  @Column()
  status!: string;

  @Column()
  totalEmployees!: number;

  @Column({ nullable: true })
  address!: string;

  @Column({ nullable: true })
  city!: string;

  @Column({ nullable: true })
  postalCode!: string;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0.0 })
  percentage!: number;

  @Column({ type: "text", nullable: true })
  franchiseLogo!: string | null;

  @Column({ nullable: true })
  phoneNumber!: string;

  @Column({ nullable: true })
  emailAddress!: string;

  @OneToMany(() => Billing, (billing) => billing.franchise)
  billings!: Billing[];

  @ManyToMany(() => User, (user) => user.franchises)
  @JoinTable()
  admins!: User[];

  @OneToMany(() => Location, (location) => location.franchise)
  locations!: Location[];

  @OneToMany(
    () => ContractPackage,
    (contractPackage) => contractPackage.franchise
  )
  contractPackages: ContractPackage[];

  @OneToMany(() => Topic, (topic) => topic.franchise)
  topics!: Topic[];
}

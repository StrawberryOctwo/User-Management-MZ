import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { PackageSessionTypePrice } from "./packageSessionTypePrice.entity";
import { SoftDeleteBaseEntity } from "./softDelete.entity";
import { SessionInstance } from "./class-session-instance.entity";

@Entity("session_type")
export class SessionType extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(
    () => SessionInstance,
    (sessionInstance) => sessionInstance.sessionType
  )
  sessionInstances!: SessionInstance[];

  @OneToMany(
    () => PackageSessionTypePrice,
    (packageSessionTypePrice) => packageSessionTypePrice.sessionType
  )
  packageSessionTypePrices!: PackageSessionTypePrice[];
}


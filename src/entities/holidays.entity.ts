import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { SoftDeleteBaseEntity } from "./softDelete.entity";
import { Location } from "./location.entity";

@Entity("holidays")
export class Holiday extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "date" })
  start_date!: Date;

  @Column({ type: "date" })
  end_date!: Date;

  @ManyToOne(() => Location, { nullable: false })
  @JoinColumn({ name: "locationId" })
  location!: Location;
}

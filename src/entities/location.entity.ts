import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Franchise } from "./franchise.entity";
import { User } from "./user.entity";
import { Teacher } from "./teacher.entity";
import { Student } from "./student.entity";
import { SoftDeleteBaseEntity } from "./softDelete.entity";
import { SessionInstance } from "./class-session-instance.entity";
import { Room } from "./room.entity";
import { Holiday } from "./holidays.entity";
import { ClosingDay } from "./closingDay.entity";
@Entity("locations")
export class Location extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column({ nullable: true })
  city!: string;

  @Column({ type: "varchar", nullable: true })
  postalCode: string;

  @ManyToOne(() => Franchise, (franchise) => franchise.locations, {
    nullable: true,
  })
  franchise!: Franchise;

  @OneToMany(() => Holiday, (holiday) => holiday.location)
  holidays!: Holiday[];

  @OneToMany(() => ClosingDay, (closingDay) => closingDay.location)
  closingDays!: ClosingDay[];

  @ManyToMany(() => User, (user) => user.locations)
  @JoinTable()
  admins!: User[];

  @ManyToMany(() => Teacher)
  @JoinTable({
    name: "locations_teachers_teachers",
    joinColumn: { name: "locationId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "teacherId", referencedColumnName: "id" },
  })
  teachers!: Teacher[];

  @OneToMany(
    () => SessionInstance,
    (sessionInstance) => sessionInstance.location
  )
  sessionInstances!: SessionInstance[];

  @ManyToMany(() => Student)
  @JoinTable({
    name: "locations_students_students",
    joinColumn: { name: "locationId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "studentId", referencedColumnName: "id" },
  })
  students!: Student[];

  @OneToMany(() => Room, (room) => room.location)
  rooms!: Room[];

  @Column({ type: "int", default: 0 })
  numberOfRooms!: number;

  totalTeachers?: number;
  totalStudents?: number;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "./role.entity";
import { Franchise } from "./franchise.entity";
import { Location } from "./location.entity";
import { FileUpload } from "./file-upload.entity";
import { Teacher } from "./teacher.entity";
import { Student } from "./student.entity";
import { Payment } from "./payment.entity";
import { Event } from "./event.entity";
import { Parent } from "./parent.entity";
import { Invoice } from "./invoice.entity";
import { UserSurvey } from "./userSurvey.entity";
import { ToDoAssignee } from "./todoAssignee.entity";
import { SoftDeleteBaseEntity } from "./softDelete.entity";
import { Notification } from "./notification.entity";
import { UserNotification } from "./user-notification.entity";

@Entity("users")
export class User extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  dob!: Date;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  address!: string;

  @Column({ nullable: true })
  city!: string;

  @Column()
  postalCode!: string;

  @Column()
  phoneNumber!: string;

  @OneToMany(
    () => UserNotification,
    (userNotification) => userNotification.user
  )
  userNotifications!: UserNotification[];

  @ManyToMany(() => Role)
  @JoinTable({ name: "users_roles_roles" })
  roles!: Role[];

  @OneToMany(() => UserSurvey, (userSurvey) => userSurvey.user)
  userSurveys!: UserSurvey[];
  @OneToMany(() => FileUpload, (fileUpload) => fileUpload.user)
  files!: FileUpload[];

  @OneToMany(() => Teacher, (teacher) => teacher.user)
  teachers!: Teacher[];

  @ManyToMany(() => Franchise, (franchise) => franchise.admins)
  franchises!: Franchise[];

  @ManyToMany(() => Location, (location) => location.admins)
  locations!: Location[];

  @OneToMany(() => Student, (student) => student.user)
  students!: Student[];

  @OneToMany(() => Parent, (parent) => parent.user)
  parents!: Student[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments!: Payment[];

  @OneToMany(() => ToDoAssignee, (todoAssignee) => todoAssignee.user)
  assignedToDos!: ToDoAssignee[];

  @ManyToMany(() => Event)
  @JoinTable({
    name: "events_specific_users_users",
    joinColumn: { name: "usersId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "eventsId", referencedColumnName: "id" },
  })
  events!: Event[];

  @OneToMany(() => Invoice, (invoice) => invoice.user)
  invoices!: Invoice[];
}


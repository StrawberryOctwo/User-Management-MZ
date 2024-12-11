import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { SoftDeleteBaseEntity } from "./softDelete.entity";
import { UserNotification } from "./user-notification.entity";

@Entity("notifications")
export class Notification extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  message!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  eventType?: string;

  @OneToMany(
    () => UserNotification,
    (userNotification) => userNotification.notification
  )
  userNotifications!: UserNotification[];
}


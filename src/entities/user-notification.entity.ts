import { Entity, ManyToOne, Column, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";
import { Notification } from "./notification.entity";

@Entity("user_notifications")
export class UserNotification {
  @PrimaryColumn()
  userId!: number;

  @PrimaryColumn()
  notificationId!: number;

  @ManyToOne(() => User, (user) => user.userNotifications, { eager: true })
  user!: User;

  @ManyToOne(
    () => Notification,
    (notification) => notification.userNotifications,
    { eager: true }
  )
  notification!: Notification;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ nullable: true })
  readAt?: Date;
}

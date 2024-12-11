import { AppDataSource } from "../config/data-source";
import { Notification } from "../entities/notification.entity";
import { UserNotification } from "../entities/user-notification.entity";
import { sendEmailNotification } from "./helperFunctions/notificationHelper";
import { INotification } from "../types/express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Response } from "express";
import { User } from "../entities/user.entity";

export class NotificationService {
  private static clients: { userId: number; res: any }[] = [];

  // Add a client to the SSE connections
  static addClient(userId: number, res: any) {
    console.log(`Adding SSE client for user ${userId}`);

    const existingClient = this.clients.find(
      (client) => client.userId === userId
    );
    if (existingClient) {
      console.log(`User ${userId} already connected`);
      return;
    }

    this.clients.push({ userId, res });
  }

  // Remove a client from the SSE connections
  static removeClient(res: any) {
    console.log("Removing SSE client");
    this.clients = this.clients.filter((client) => client.res !== res);
  }

  // Send a real-time notification using SSE
  static sendRealTimeNotification(notification: INotification) {
    const userIds = notification.users.map((user) => user.id);

    // Create a new notification object without the users array
    const { users, ...notificationWithoutUsers } = notification;

    userIds.forEach((userId) => {
      const targetClients = this.clients.filter(
        (client) => client.userId === userId
      );
      targetClients.forEach((client) => {
        client.res.write(
          `data: ${JSON.stringify(notificationWithoutUsers)}\n\n`
        );
      });
    });
  }

  // Create and send a notification
  static async createNotification(
    userIds: number[],
    title: string,
    message: string,
    eventType: string
  ) {
    if (userIds.length === 0) {
      console.error("No valid user IDs provided");
      throw new Error("No valid user IDs provided");
    }
    const notificationRepository = AppDataSource.getRepository(Notification);
    const userNotificationRepository =
      AppDataSource.getRepository(UserNotification);

    try {
      // Validate user IDs
      const validUsers = await AppDataSource.getRepository(User)
        .createQueryBuilder("user")
        .where("user.id IN (:...userIds)", { userIds })
        .getMany();

      const validUserIds = validUsers.map((user) => user.id);

      if (validUserIds.length === 0) {
        console.error("No valid user IDs found");
        throw new Error("No valid user IDs found");
      }

      // Create a new notification
      const notification = notificationRepository.create({
        title,
        message,
        eventType,
      });

      await notificationRepository.save(notification);

      // Create UserNotification links for all valid user IDs
      const userNotifications = validUserIds.map((userId) =>
        userNotificationRepository.create({
          userId,
          notificationId: notification.id,
          isRead: false,
        })
      );

      await userNotificationRepository.save(userNotifications);

      // Send real-time notification via SSE to all users
      const transformedNotification: INotification = {
        id: notification.id,
        createdAt: notification.createdAt,
        title: notification.title,
        message: notification.message,
        eventType: notification.eventType,
        isRead: false,
        users: validUserIds.map((userId) => ({ id: userId })),
      };
      this.sendRealTimeNotification(transformedNotification);

      // Trigger email notifications for all users

      await Promise.all(
        validUserIds.map(async (userId) => {
          try {
            await sendEmailNotification(
              userId,
              title,
              eventType,
              new Date().toDateString(),
              "Verwaltung",
              message
            );
          } catch (error) {
            console.error(`Failed to send email to user ${userId}:`, error);
          }
        })
      );
      console.log("Email notifications sent successfully!");

    } catch (error) {
      console.error("Failed to create notification:", error);
      throw new Error("Notification creation failed");
    }
  }

  static async getNotifications(req: AuthenticatedRequest, res: Response) {
    const userNotificationRepository =
      AppDataSource.getRepository(UserNotification);

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const offset = (page - 1) * limit;

    try {
      const [notifications, total] =
        await userNotificationRepository.findAndCount({
          where: { user: { id: userId } },
          relations: ["notification"],
          order: { notification: { createdAt: "DESC" } },
          take: limit,
          skip: offset,
        });
      const unreadCount = await userNotificationRepository.count({
        where: { user: { id: userId }, isRead: false },
      });

      res.json({
        notifications: notifications.map((userNotification) => ({
          id: userNotification.notification.id,
          createdAt: userNotification.notification.createdAt,
          title: userNotification.notification.title,
          message: userNotification.notification.message,
          eventType: userNotification.notification.eventType,
          isRead: userNotification.isRead,
        })),
        total,
        unreadCount,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  }

  static async markNotificationAsRead(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const userNotificationRepository =
      AppDataSource.getRepository(UserNotification);

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const notificationId = Number(req.params.id);

    try {
      const userNotification = await userNotificationRepository.findOne({
        where: { user: { id: userId }, notification: { id: notificationId } },
      });

      if (!userNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      userNotification.isRead = true;
      userNotification.readAt = new Date();
      await userNotificationRepository.save(userNotification);

      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  }
}


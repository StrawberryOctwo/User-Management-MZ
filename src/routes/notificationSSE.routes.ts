import {NotificationService} from "../controllers/notification.controller";
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AppDataSource } from "../config/data-source";
import { Location } from "../entities/location.entity";
import { Franchise } from "../entities/franchise.entity";

const router = Router();

// SSE Endpoint
router.get("/notifications/connect", (req, res) => {
  const userId = Number(req.query.userId);

  if (!userId || isNaN(userId)) {
    res.status(400).send("Invalid user ID");
    return;
  }

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Add the client to the list
  NotificationService.addClient(userId, res);

  // Send an initial event to confirm connection
  res.write(
    `connection established for user ${userId} at ${new Date().toISOString()}\n\n`
  );

  // Send a keep-alive message every 30 seconds
  const keepAliveInterval = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 30000);

  // Remove the client when the connection is closed
  req.on("close", () => {
    clearInterval(keepAliveInterval);
    NotificationService.removeClient(res);
  });
});

router.get(
  "/notifications",
  authMiddleware(
    [
      "SuperAdmin",
      "FranchiseAdmin",
      "LocationAdmin",
      "Teacher",
      "Parent",
      "Student",
    ],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  NotificationService.getNotifications
);

router.put(
  "/notifications/:id/read",
  authMiddleware(
    [
      "SuperAdmin",
      "FranchiseAdmin",
      "LocationAdmin",
      "Teacher",
      "Parent",
      "Student",
    ],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  NotificationService.markNotificationAsRead
);

export default router;

import { Router } from "express";
import { TopicController } from "../controllers/topic.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AppDataSource } from "../config/data-source";
import { Topic } from "../entities/topic.entity";
import { Franchise } from "../entities/franchise.entity";
import { Location } from "../entities/location.entity";
const router = Router();

router.get(
  "/topics",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher"],
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
    ]
  ),
  TopicController.getTopics
);

router.post(
  "/topic",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin"],
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
    ]
  ),
  TopicController.addTopic
);

router.put(
  "/topic/:id",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin"],
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
    ]
  ),
  TopicController.updateTopic
);

router.get(
  "/topic/:id",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher"],
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
    ]
  ),
  TopicController.getTopicById
);

router.post(
  "/topic/delete",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher"],
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
    ]
  ),
  TopicController.deleteTopic
);

router.post(
  "/topics/assign-teacher",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  TopicController.assignOrUpdateTeacherTopics
);

router.post(
  "/topics/assign-student",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher"],
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
    ]
  ),
  TopicController.assignOrUpdateStudentTopics
);

export default router;

import { Router } from "express";
import { ToDoController } from "../controllers/todo.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AppDataSource } from "../config/data-source";
import { Franchise } from "../entities/franchise.entity";
import { Location } from "../entities/location.entity";

const router = Router();


router.post(
  "/todos",
  authMiddleware(
    ["FranchiseAdmin", "LocationAdmin", "Teacher"],
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
  ToDoController.createToDo
);


router.put(
  "/todos/:todoId/assign-users",
  authMiddleware(
    ["FranchiseAdmin", "LocationAdmin", "Teacher"],
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
  ToDoController.assignToDoToUsers
);


router.get(
  "/todos/:todoId/assigned-users",
  authMiddleware(
    ["FranchiseAdmin", "LocationAdmin", "Teacher"],
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
  ToDoController.getAssignedUsers
);


router.get(
  "/todos",
  authMiddleware(["FranchiseAdmin", "LocationAdmin", "Teacher", "Student"]),
  ToDoController.getToDos
);


router.get(
  "/todos/self",
  authMiddleware(
    ["FranchiseAdmin", "LocationAdmin", "Teacher", "Student"],
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
    ]
  ),
  ToDoController.getToDosForSelf
);


router.post(
  "/todos/:todoId/assign",
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
  ToDoController.assignToDoToRole
);


router.patch(
  "/todos/:todoId/toggle-completion",
  authMiddleware(
    ["FranchiseAdmin", "LocationAdmin", "Teacher", "Student"],
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
    ]
  ),
  ToDoController.markAsCompleted
);


router.delete(
  "/todos/:todoId",
  authMiddleware(["FranchiseAdmin", "LocationAdmin", "Teacher"]),
  ToDoController.deleteToDo
);

router.delete(
  "/todos/:todoId/users/:userId",
  authMiddleware(["FranchiseAdmin", "LocationAdmin", "Teacher"], [
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
  ]),
  ToDoController.removeUserFromToDo
);


router.get(
  "/todos/created-by",
  authMiddleware(
    ["FranchiseAdmin", "LocationAdmin", "Teacher"],
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
  ToDoController.getToDosByAssignedBy
);


router.get(
  "/todos/assigned-to/:assignedId",
  authMiddleware(["FranchiseAdmin", "LocationAdmin", "Teacher", "Student"]),
  ToDoController.getToDosByAssignedTo
);

export default router;


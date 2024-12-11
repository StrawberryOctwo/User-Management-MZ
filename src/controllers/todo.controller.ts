import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { ToDo } from "../entities/todo.entity";
import { User } from "../entities/user.entity";
import { Location } from "../entities/location.entity";
import { Franchise } from "../entities/franchise.entity";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Role } from "../entities/role.entity";
import { applyRoleBasedFilters } from "../utils/roleBased";
import { Brackets, In, QueryFailedError } from "typeorm";
import { ToDoAssignee } from "../entities/todoAssignee.entity";

export class ToDoController {
  static async createToDo(req: AuthenticatedRequest, res: Response) {
    const { title, description, dueDate, priority } = req.body;
    const assignedBy = req.user;

    try {
      const todoRepository = AppDataSource.getRepository(ToDo);
      const newToDo = todoRepository.create({
        title,
        description,
        dueDate,
        priority,
        assignedBy,
      });

      const savedToDo = await todoRepository.save(newToDo);
      res
        .status(201)
        .json({ message: "ToDo created successfully", toDoId: savedToDo.id });
    } catch (error) {
      console.error("Error creating ToDo:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getToDos(req: AuthenticatedRequest, res: Response) {
    const {
      page = 1,
      limit = 10,
      search,
      priority,
      sortBy = "date",
    } = req.query;

    try {
      const todoRepository = AppDataSource.getRepository(ToDo);
      let query = todoRepository
        .createQueryBuilder("todo")
        .leftJoinAndSelect("todo.assignedBy", "assignedBy")
        .where("todo.completed = :completed", { completed: false });

      if (search) {
        query = query.andWhere("todo.title ILIKE :search", {
          search: `%${search}%`,
        });
      }

      if (priority) {
        query = query.andWhere("todo.priority = :priority", { priority });
      }

      if (sortBy === "date") {
        query = query.orderBy("todo.dueDate", "ASC");
      } else if (sortBy === "priority") {
        query = query.orderBy("todo.priority", "ASC");
      }


      const [todos, total] = await query
        .take(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .getManyAndCount();

      res.status(200).json({
        data: todos,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error("Error fetching ToDos:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }


  static async getToDosByAssignedBy(req: AuthenticatedRequest, res: Response) {
    let { assignedById } = req.params;
    const { page = 1, limit = 10 } = req.query;


    if (!assignedById) {
      if (!req.user) {
        return res.status(400).json({ message: "User ID is required" });
      }
      assignedById = String(req.user.id);
    }

    try {
      const todoRepository = AppDataSource.getRepository(ToDo);

      const [todos, total] = await todoRepository
        .createQueryBuilder("todo")
        .select([
          "todo.id",
          "todo.title",
          "todo.priority",
          "todo.dueDate",
          "todo.assignedRoles",
        ])
        .where("todo.assignedBy = :assignedById", {
          assignedById: Number(assignedById),
        })
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .getManyAndCount();

      res.status(200).json({
        data: todos,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error("Error fetching ToDos by assignedBy:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }


  static async getToDosByAssignedTo(req: AuthenticatedRequest, res: Response) {
    const { assignedId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
      const todoRepository = AppDataSource.getRepository(ToDo);

      const [todos, total] = await todoRepository.findAndCount({
        where: { assignees: { id: Number(assignedId) } },
        relations: ["assignedBy", "assignees"],
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      });

      res.status(200).json({
        data: todos,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error("Error fetching ToDos by assignedId:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  static async getToDosForSelf(req: AuthenticatedRequest, res: Response) {
    const {
      page = 1,
      limit = 10,
      sort = "priority",
      search,
      priority,
    } = req.query;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    try {
      const query = AppDataSource.getRepository(ToDoAssignee)
        .createQueryBuilder("todoAssignee")
        .leftJoinAndSelect("todoAssignee.todo", "todo")
        .leftJoinAndSelect("todo.assignedBy", "assignedBy")
        .where("todoAssignee.userId = :userId", { userId });

      if (search) {
        query.andWhere(
          "(todo.title ILIKE :search OR todo.description ILIKE :search)",
          { search: `%${search}%` }
        );
      }

      if (priority) {
        query.andWhere("todo.priority = :priority", { priority });
      }

      query.orderBy("todoAssignee.completed", "ASC");
      query.addOrderBy(`todo.${sort}`, "DESC");

      query.skip((Number(page) - 1) * Number(limit)).take(Number(limit));


      const [todoAssignees, total] = await query.getManyAndCount();


      const todos = todoAssignees.map((todoAssignee) => ({
        id: todoAssignee.todo.id,
        title: todoAssignee.todo.title,
        description: todoAssignee.todo.description,
        dueDate: todoAssignee.todo.dueDate,
        priority: todoAssignee.todo.priority,
        assignedBy: {
          id: todoAssignee.todo.assignedBy?.id,
          firstName: todoAssignee.todo.assignedBy?.firstName,
          lastName: todoAssignee.todo.assignedBy?.lastName,
        },
        completed: todoAssignee.completed,
      }));


      const pendingCount = await AppDataSource.getRepository(ToDoAssignee)
        .createQueryBuilder("todoAssignee")
        .leftJoin("todoAssignee.todo", "todo")
        .where("todoAssignee.userId = :userId", { userId })
        .andWhere("todoAssignee.completed = :completed", { completed: false })
        .getCount();

      res.status(200).json({
        data: todos,
        total,
        pendingCount,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error("Error fetching ToDos for self:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async assignToDoToRole(req: AuthenticatedRequest, res: Response) {
    const { todoId } = req.params;
    const { role } = req.body;
    const user = req.user;

    try {
      const todoRepository = AppDataSource.getRepository(ToDo);
      const todoAssigneeRepository = AppDataSource.getRepository(ToDoAssignee);
      const todo = await todoRepository.findOne({
        where: { id: Number(todoId) },
      });

      if (!todo) {
        return res.status(404).json({ message: "ToDo not found" });
      }
      if (!user) {
        return res.status(400).json({ message: "User is not authenticated" });
      }

      let assignees: User[] = [];
      if (role === "FranchiseAdmin") {
        const franchiseRepository = AppDataSource.getRepository(Franchise);
        const franchises = await franchiseRepository.find({

          relations: ["admins"],
        });

        assignees = franchises.flatMap((franchise) => franchise.admins);
      } else if (role === "LocationAdmin") {
        const locationRepository = AppDataSource.getRepository(Location);
        const locations = await locationRepository
          .createQueryBuilder("location")
          .leftJoinAndSelect("location.franchise", "franchise")
          .leftJoinAndSelect("location.admins", "locationAdmin")
          .leftJoinAndSelect("franchise.admins", "franchiseAdmin")
          .where("franchiseAdmin.id = :userId", { userId: user.id })
          .select(["location.id", "locationAdmin.id"])
          .getMany();
        assignees = locations.flatMap((location) => location.admins);
      } else if (role === "Teacher") {
        const locationRepository = AppDataSource.getRepository(Location);
        const locations = await locationRepository
          .createQueryBuilder("location")
          .leftJoinAndSelect("location.franchise", "franchise")
          .leftJoinAndSelect("location.admins", "locationAdmin")
          .leftJoinAndSelect("location.teachers", "teachers")
          .leftJoinAndSelect("teachers.user", "teachersUser")
          .leftJoinAndSelect("franchise.admins", "franchiseAdmin")
          .where("franchiseAdmin.id = :userId OR locationAdmin.id = :userId", {
            userId: user.id,
          })
          .select(["location.id", "teachers.id", "teachersUser.id"])
          .getMany();
        console.log(locations);
        assignees = locations.flatMap((location) =>
          location.teachers.map((teacher) => teacher.user)
        );
      } else if (role === "Student") {
        const locationRepository = AppDataSource.getRepository(Location);
        const locations = await locationRepository
          .createQueryBuilder("location")
          .leftJoinAndSelect("location.franchise", "franchise")
          .leftJoinAndSelect("location.admins", "locationAdmin")
          .leftJoinAndSelect("location.teachers", "teacher")
          .leftJoinAndSelect("teacher.user", "teacherUser")
          .leftJoinAndSelect("location.students", "students")
          .leftJoinAndSelect("students.user", "studentsUser")
          .leftJoinAndSelect("franchise.admins", "franchiseAdmin")
          .where(
            "franchiseAdmin.id = :userId OR locationAdmin.id = :userId OR teacherUser.id = :userId",
            { userId: user.id }
          )
          .select(["location.id", "students.id", "studentsUser.id"])
          .getMany();

        console.log(locations);


        assignees = locations.flatMap((location) =>
          location.students.map((student) => student.user)
        );
      } else {
        return res.status(400).json({ message: "Invalid role specified" });
      }

      const uniqueAssignees = Array.from(
        new Map(assignees.map((user) => [user.id, user])).values()
      );

      const currentAssignees = await todoAssigneeRepository
        .createQueryBuilder("todoAssignee")
        .leftJoin("todoAssignee.user", "user")
        .where("todoAssignee.todoId = :todoId", { todoId: Number(todoId) })
        .select(["user.id"])
        .getRawMany();


      const currentAssigneeIds = currentAssignees.map(
        (assignee) => assignee.user_id
      );


      const newAssigneeIds = uniqueAssignees.map((user) => user.id);
      const assigneesToDelete = currentAssignees
        .filter((assignee) => !newAssigneeIds.includes(assignee.user_id))
        .map((assignee) => ({ id: assignee.user_id }));

      if (assigneesToDelete.length > 0) {
        await todoAssigneeRepository.delete({
          todo: { id: Number(todoId) },
          user: In(assigneesToDelete.map((assignee) => assignee.id)),
        });
      }


      const newAssignees = uniqueAssignees.filter(
        (user) => !currentAssigneeIds.includes(user.id)
      );


      const todoAssignees = newAssignees.map((user) => {
        const todoAssignee = new ToDoAssignee();
        todoAssignee.todo = todo;
        todoAssignee.user = user;
        todoAssignee.completed = false;
        return todoAssignee;
      });

      if (todoAssignees.length > 0) {
        await todoAssigneeRepository.save(todoAssignees);
      }


      todo.assignedRoles = role;
      await todoRepository.save(todo);

      res
        .status(200)
        .json({ message: `ToDo assigned to ${role}s successfully` });
    } catch (error) {
      console.error("Error assigning ToDo:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async markAsCompleted(req: AuthenticatedRequest, res: Response) {
    const { todoId } = req.params;

    if (!req.user) {
      return;
    }
    const userId = req.user.id;
    try {
      const todoAssigneeRepository = AppDataSource.getRepository(ToDoAssignee);


      const todoAssignee = await todoAssigneeRepository.findOne({
        where: {
          todo: { id: Number(todoId) },
          user: { id: Number(userId) },
        },
      });

      if (!todoAssignee) {
        return res.status(404).json({ message: "ToDoAssignee not found" });
      }


      todoAssignee.completed = !todoAssignee.completed;
      await todoAssigneeRepository.save(todoAssignee);

      res
        .status(200)
        .json({ message: "ToDo marked as completed successfully" });
    } catch (error) {
      console.error("Error updating completion status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async deleteToDo(req: AuthenticatedRequest, res: Response) {
    const { todoId } = req.params;

    try {
      const todoRepository = AppDataSource.getRepository(ToDo);
      const todo = await todoRepository.findOne({
        where: { id: Number(todoId) },
      });

      if (!todo) {
        return res.status(404).json({ message: "ToDo not found" });
      }

      await todoRepository.remove(todo);
      res.status(200).json({ message: "ToDo deleted successfully" });
    } catch (error) {
      console.error("Error deleting ToDo:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async assignToDoToUsers(req: AuthenticatedRequest, res: Response) {
    const { todoId } = req.params;
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: "userIds should be a non-empty array" });
    }

    try {
      const todoRepository = AppDataSource.getRepository(ToDo);
      const todoAssigneeRepository = AppDataSource.getRepository(ToDoAssignee);
      const userRepository = AppDataSource.getRepository(User);


      const todo = await todoRepository.findOne({
        where: { id: Number(todoId) },
      });
      if (!todo) {
        return res.status(404).json({ message: "ToDo not found" });
      }


      const users = await userRepository.find({
        where: { id: In(userIds) },
      });
      if (users.length === 0) {
        return res
          .status(404)
          .json({ message: "No users found with the provided IDs" });
      }


      const currentAssignees = await todoAssigneeRepository.find({
        where: { todo: { id: Number(todoId) } },
        relations: ["user"],
      });


      const newAssigneeIds = userIds;
      const assigneesToDelete = currentAssignees.filter(
        (assignee) => !newAssigneeIds.includes(assignee.user.id)
      );
      await todoAssigneeRepository.remove(assigneesToDelete);


      const existingAssigneeIds = currentAssignees.map(
        (assignee) => assignee.user.id
      );
      const newAssignees = users.filter(
        (user) => !existingAssigneeIds.includes(user.id)
      );


      const todoAssignees = newAssignees.map((user) => {
        const todoAssignee = new ToDoAssignee();
        todoAssignee.todo = todo;
        todoAssignee.user = user;
        todoAssignee.completed = false;
        return todoAssignee;
      });
      await todoAssigneeRepository.save(todoAssignees);
      todo.assignedRoles = "Custom";
      await todoRepository.save(todo);
      res.status(200).json({
        message: "ToDo assigned to specified users successfully",
        assignedUserIds: users.map((user) => user.id),
      });
    } catch (error) {
      console.error("Error assigning ToDo to users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getAssignedUsers(req: AuthenticatedRequest, res: Response) {
    const { todoId } = req.params;
    const { page = 1, limit = 10, search = "", role } = req.query;

    try {
      const todoAssigneeRepository = AppDataSource.getRepository(ToDoAssignee);

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const searchTerms = typeof search === "string" ? search.split(" ").filter(Boolean) : [];
      const roleFilter = role ? `role.name = :role` : `1=1`;

      const [assignees, total] = await todoAssigneeRepository
        .createQueryBuilder("todoAssignee")
        .leftJoinAndSelect("todoAssignee.user", "user")
        .leftJoinAndSelect("user.roles", "role")
        .where("todoAssignee.todo = :todoId", { todoId: Number(todoId) })
        .andWhere(roleFilter, { role })
        .andWhere(
          new Brackets((qb) => {
            if (searchTerms.length === 1) {

              qb.where("user.firstName ILIKE :search", { search: `%${search}%` })
                .orWhere("user.lastName ILIKE :search", { search: `%${search}%` })
                .orWhere("user.email ILIKE :search", { search: `%${search}%` });
            } else if (searchTerms.length > 1) {

              qb.where(
                "CONCAT(user.firstName, ' ', user.lastName) ILIKE :search",
                { search: `%${search}%` }
              );
            }
          })
        )
        .select([
          "todoAssignee.id",
          "todoAssignee.completed",
          "user.id",
          "user.firstName",
          "user.lastName",
          "user.email",
          "role.name",
        ])
        .distinct(true)
        .skip(skip)
        .take(take)
        .getManyAndCount();

      const transformedAssignees = assignees.map((assignee) => {
        const isTeacherOrStudent = assignee.user.roles.some(
          (role) => role.name === "Teacher" || role.name === "Student"
        );

        return {
          [isTeacherOrStudent ? "userId" : "id"]: assignee.user.id,
          firstName: assignee.user.firstName,
          lastName: assignee.user.lastName,
          email: assignee.user.email,
          roles: assignee.user.roles.map((role) => role.name),
          completed: assignee.completed,
        };
      });


      res.status(200).json({
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
        total: total,
        assignees: transformedAssignees,
      });
    } catch (error) {
      console.error("Error fetching assigned users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }


  static async removeUserFromToDo(req: AuthenticatedRequest, res: Response) {
    const { todoId, userId } = req.params;

    try {
      const todoAssigneeRepository = AppDataSource.getRepository(ToDoAssignee);

      // Find the specific assignment
      const todoAssignee = await todoAssigneeRepository.findOne({
        where: {
          todo: { id: Number(todoId) },
          user: { id: Number(userId) }
        }
      });

      if (!todoAssignee) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Remove the assignment
      await todoAssigneeRepository.remove(todoAssignee);

      // Check if this was the last assignee and update todo.assignedRoles if needed
      const remainingAssignees = await todoAssigneeRepository.count({
        where: { todo: { id: Number(todoId) } }
      });

      if (remainingAssignees === 0) {
        const todoRepository = AppDataSource.getRepository(ToDo);
        const todo = await todoRepository.findOne({
          where: { id: Number(todoId) }
        });
        if (todo) {
          todo.assignedRoles = '';
          await todoRepository.save(todo);
        }
      }

      res.status(200).json({ message: "User removed from ToDo successfully" });
    } catch (error) {
      console.error("Error removing user from ToDo:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

}


import { Response } from "express";
import { Topic } from "../entities/topic.entity";
import { AppDataSource } from "../config/data-source";
import { Franchise } from "../entities/franchise.entity";
import { User } from "../entities/user.entity";
import { Teacher } from "../entities/teacher.entity";
import { Brackets, In, Like } from "typeorm";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Student } from "../entities/student.entity";

export class TopicController {
  static async addTopic(req: AuthenticatedRequest, res: Response) {
    const { name, franchiseId } = req.body;

    try {
      const topicRepository = AppDataSource.getRepository(Topic);
      const franchiseRepository = AppDataSource.getRepository(Franchise);

      const franchise = await franchiseRepository.findOne({
        where: { id: franchiseId },
      });
      if (!franchise) {
        return res.status(400).json({ message: "Invalid franchise ID" }); 
      }

      const topic = topicRepository.create({
        name,
        franchise,
      });

      await topicRepository.save(topic);
      res.status(201).json({ message: "Topic added successfully" });
    } catch (error) {
      console.error("Error adding Topic:", error);
      res.status(500).json({ message: "Error adding Topic" });
    }
  }

  static async getTopics(req: AuthenticatedRequest, res: Response) {
    const { page = 1, limit = 10, search, fields } = req.query;

    try {
      const topicRepository = AppDataSource.getRepository(Topic);
      const query = topicRepository
        .createQueryBuilder("topic")
        .leftJoinAndSelect("topic.franchise", "franchise")
        .orderBy("topic.createdAt", "DESC")

        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit));

      if (typeof search === "string") {
        query.andWhere(
          new Brackets((qb) => {
            qb.where("topic.name ILIKE :search", {
              search: `%${search}%`,
            }).orWhere("franchise.name ILIKE :search", {
              search: `%${search}%`,
            });
          })
        );
      }

      if (req.entities?.franchises) {
        const franchiseIds = req.entities.franchises.map(
          (franchise) => franchise.id
        );
        query.andWhere("topic.franchiseId IN (:...franchiseIds)", {
          franchiseIds,
        });
      }
      if (req.entities?.locations) {
        const locationIds = req.entities.locations.map(
          (location) => location.id
        );

        const franchiseRepository = AppDataSource.getRepository(Franchise);
        const franchisesWithLocations = await franchiseRepository
          .createQueryBuilder("franchise")
          .leftJoinAndSelect("franchise.locations", "location")
          .where("location.id IN (:...locationIds)", { locationIds })
          .getMany();

        const franchiseIds = franchisesWithLocations.map(
          (franchise) => franchise.id
        );

        if (franchiseIds.length > 0) {
          query.andWhere("topic.franchiseId IN (:...franchiseIds)", {
            franchiseIds,
          });
        }
      }

      if (typeof fields === "string") {
        const selectedFields = fields
          .split(",")
          .map((field: string) => `topic.${field.trim()}`);

        if (!selectedFields.includes("topic.id")) {
          selectedFields.push("topic.id");
        }
        if (!selectedFields.includes("topic.createdAt")) {
          selectedFields.push("topic.createdAt");
        }

        query.select(selectedFields);

        if (fields.includes("franchise")) {
          query.addSelect("franchise.name");
        }
      } else {
        query.select([
          "topic.id",
          "topic.name",
          "topic.createdAt",
          "franchise.id",
          "franchise.name",
        ]);
      }

      const topics = await query.getMany();
      const total = await query.getCount();
      const pageCount = Math.ceil(total / Number(limit));

      return res.status(200).json({
        data: topics,
        total,
        page: Number(page),
        pageCount,
      });
    } catch (error) {
      console.error("Error fetching Topics", error);
      return res.status(500).json({ message: "Server error: " + error });
    }
  }

  static async assignOrUpdateTeacherTopics(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { topicIds, teacherId } = req.body;

    if (!teacherId || isNaN(Number(teacherId))) {
      return res.status(400).json({ message: "Valid teacherId is required" });
    }

    try {
      const topicRepository = AppDataSource.getRepository(Topic);
      const teacherRepository = AppDataSource.getRepository(Teacher);

      const teacher = await teacherRepository.findOne({
        where: { id: Number(teacherId) },
        relations: ["topics"],
      });

      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      if (Array.isArray(topicIds) && topicIds.length === 0) {
        teacher.topics = [];
      } else {
        const numericTopicIds = topicIds
          .map((id: any) => Number(id))
          .filter((id: number) => !isNaN(id));

        const topics = await topicRepository.find({
          where: { id: In(numericTopicIds) },
        });

        const foundTopicIds = topics.map((t) => t.id);
        const missingTopicIds = numericTopicIds.filter(
          (id: number) => !foundTopicIds.includes(id)
        );

        if (missingTopicIds.length > 0) {
          return res.status(404).json({
            message: `Topics not found: ${missingTopicIds.join(", ")}`,
          });
        }

        teacher.topics = teacher.topics.filter((topic) =>
          numericTopicIds.includes(topic.id)
        );

        for (const topic of topics) {
          if (!teacher.topics.some((t) => t.id === topic.id)) {
            teacher.topics.push(topic);
          }
        }
      }

      await teacherRepository.save(teacher);

      res.status(200).json({ message: "Teacher topics updated successfully" });
    } catch (error) {
      console.error("Error updating teacher topics:", error);
      res.status(500).json({ message: "Error updating teacher topics" });
    }
  }

  static async assignOrUpdateStudentTopics(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { topicIds, studentId } = req.body;

    if (!studentId || isNaN(Number(studentId))) {
      return res.status(400).json({ message: "Valid studentId is required" });
    }

    try {
      const topicRepository = AppDataSource.getRepository(Topic);
      const studentRepository = AppDataSource.getRepository(Student);

      const student = await studentRepository.findOne({
        where: { id: Number(studentId) },
        relations: ["topics"],
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const numericTopicIds = topicIds
        .map((id: any) => Number(id))
        .filter((id: number) => !isNaN(id));

      const topics = await topicRepository.find({
        where: { id: In(numericTopicIds) },
      });

      const foundTopicIds = topics.map((t) => t.id);
      const missingTopicIds = numericTopicIds.filter(
        (id: number) => !foundTopicIds.includes(id)
      );

      if (missingTopicIds.length > 0) {
        return res
          .status(404)
          .json({ message: `Topics not found: ${missingTopicIds.join(", ")}` });
      }

      student.topics = student.topics.filter((topic) =>
        numericTopicIds.includes(topic.id)
      );

      for (const topic of topics) {
        if (!student.topics.some((t) => t.id === topic.id)) {
          student.topics.push(topic);
        }
      }

      await studentRepository.save(student);

      res.status(200).json({ message: "Student topics updated successfully" });
    } catch (error) {
      console.error("Error updating student topics:", error);
      res.status(500).json({ message: "Error updating student topics" });
    }
  }

  static async getTopicById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    try {
      const topicRepository = AppDataSource.getRepository(Topic);

      const topic = await topicRepository.findOne({
        where: { id: Number(id) },
        relations: ["franchise"],
      });

      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      return res.status(200).json({
        id: topic.id,
        name: topic.name,
        franchise: topic.franchise
          ? { id: topic.franchise.id, name: topic.franchise.name }
          : null,
      });
    } catch (error) {
      console.error("Error fetching topic by ID:", error);
      return res.status(500).json({ message: "Error fetching topic" });
    }
  }

  static async updateTopic(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { name, franchiseId } = req.body;

    try {
      const topicRepository = AppDataSource.getRepository(Topic);
      const franchiseRepository = AppDataSource.getRepository(Franchise);

      const topic = await topicRepository.findOne({
        where: { id: Number(id) },
      });

      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      if (franchiseId) {
        const franchise = await franchiseRepository.findOne({
          where: { id: franchiseId },
        });
        if (!franchise) {
          return res.status(400).json({ message: "Invalid franchise ID" });
        }
        topic.franchise = franchise;
      }

      topic.name = name || topic.name;

      await topicRepository.save(topic);

      return res.status(200).json({ message: "Topic updated successfully" });
    } catch (error) {
      console.error("Error updating topic:", error);
      return res.status(500).json({ message: "Error updating topic" });
    }
  }

  static async deleteTopic(req: AuthenticatedRequest, res: Response) {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ message: "Invalid input: Please provide a topic ID" });
    }

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const topicRepository = queryRunner.manager.getRepository(Topic);

      await topicRepository
        .createQueryBuilder()
        .softDelete()
        .where("id = :id", { id: Number(id) })
        .execute();

      await queryRunner.commitTransaction();

      return res.status(200).json({ message: "Topic deleted successfully" });
    } catch (error) {
      await queryRunner.rollbackTransaction();

      console.error("Error deleting topic:", error);
      return res.status(500).json({ message: "Error deleting topic" });
    } finally {
      await queryRunner.release();
    }
  }
}

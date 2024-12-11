import { Request, Response } from "express";
import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import { AppDataSource } from "../config/data-source";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthController {
  static async register(req: Request, res: Response) {
    const {
      firstName,
      lastName,
      dob,
      email,
      password,
      postalCode,
      address,
      phoneNumber,
    } = req.body;

    try {
      
      const hashedPassword = await bcrypt.hash(password, 10);

      
      const user = new User();
      user.firstName = firstName;
      user.lastName = lastName;
      user.dob = dob;
      user.email = email;
      user.password = hashedPassword;
      user.postalCode = postalCode;
      user.address = address;
      user.phoneNumber = phoneNumber;

      
      await AppDataSource.getRepository(User).save(user);

      res.status(201).json(user);
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Error registering user", error });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      if (!email) {
        return res.status(404).json({ message: "Email field missing" });
      }

      if (!password) {
        return res.status(404).json({ message: "Password field missing" });
      }

      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      
      const user = await AppDataSource.getRepository(User).findOne({
        where: { email },
        relations: ["roles"], 
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      
      const roles = user.roles.map((role) => role.name);

      
      const token = jwt.sign(
        { id: user.id, roles, name: user.firstName, lastname: user.lastName }, 
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      res.json({ token });
    } catch (error) {
      console.error("Error logging user:", error);
      res.status(500).json({ message: "Error logging in", error });
    }
  }
}


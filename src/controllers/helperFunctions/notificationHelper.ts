import { AppDataSource } from "../../config/data-source";
import { User } from "../../entities/user.entity";
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import { readFile } from "fs/promises";
import { join } from "path";

export async function sendEmailNotification(
  userId: number,
  title: string,
  eventName: string,
  eventDate: string,
  location: string,
  message: string
) {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user || !user.email) return;

  const transporter = nodemailer.createTransport({
    host: "smtp.ionos.co.uk",
    port: 465, // Use 587 if 465 does not work
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Read the HTML template
  const templatePath = join(
    __dirname,
    "../../templates/email/notification.html"
  );
  const template = await readFile(templatePath, "utf-8");

  // Compile the template
  const compiledTemplate = handlebars.compile(template);

  // Render the HTML content with dynamic values
  const htmlContent = compiledTemplate({
    userName: user.firstName,
    eventName,
    eventDate,
    location,
  });

  try {
    await transporter.sendMail({
      from: `"Verwaltung" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: title,
      text: message,
      html: htmlContent,
    });
    console.log(`Email sent successfully to ${user.email}`);
  } catch (error) {
    console.error(`Failed to send email to ${user.email}:`, error);
  }
}

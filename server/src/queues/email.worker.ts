import emailQueue from "./email.queue";
import nodemailer from "nodemailer";
import { env } from "../config/env"; // ✅ import env

const transporter = nodemailer.createTransport({
  host: env.nodemailer.host,       // ✅ use env not hardcoded
  port: env.nodemailer.port,       // ✅ use env not hardcoded
  auth: {
    user: env.nodemailer.user,     // ✅ use env not hardcoded
    pass: env.nodemailer.pass,     // ✅ use env not hardcoded
  },
});

emailQueue.process(async (job) => {
  // ✅ add try catch
  try {
    const { email, jobTitle } = job.data;

    await transporter.sendMail({
      from: env.nodemailer.user,   // ✅ use env not hardcoded
      to: email,
      subject: "Application Received",
      text: `Thank you for applying to ${jobTitle}! We will get back to you soon.`,
    });

    console.log(`✅ Email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Email failed:`, error);
    throw error; // ✅ tell Bull the job failed so it retries
  }
});
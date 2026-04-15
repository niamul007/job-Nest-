import emailQueue from "./email.queue";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "chasity.reynolds@ethereal.email",
    pass: "B7bxjV9ZcVBFx59h4T",
  },
});

emailQueue.process(async (job) => {
  const { email, jobTitle } = job.data;
  await transporter.sendMail({
    from: "chasity.reynolds@ethereal.email",
    to: email,
    subject: "Application Received",
    text: `Thank you for applying to ${jobTitle}! We will get back to you soon.`,
  });
  console.log(`Email sent to ${email}`);
});
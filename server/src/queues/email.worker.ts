import emailQueue from "./email.queue";
import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.nodemailer.host,
  port: env.nodemailer.port,
  secure: false,
  auth: {
    user: env.nodemailer.user,
    pass: env.nodemailer.pass,
  },
});

// Verify SMTP connection on worker startup so misconfiguration is visible immediately.
transporter.verify((error) => {
  if (error) {
    console.error(`❌ SMTP connection failed (${env.nodemailer.host}:${env.nodemailer.port}):`, error.message);
  } else {
    console.log(`✅ SMTP ready — ${env.nodemailer.host}:${env.nodemailer.port} as ${env.nodemailer.user}`);
  }
});

// Queue lifecycle logs — visible for every job regardless of which service enqueued it.
emailQueue.on('waiting', (jobId) => console.log(`📬 Email job #${jobId} added to queue`));
emailQueue.on('active',  (job)   => console.log(`⚙️  Email job #${job.id} processing [${job.data.type} / ${job.data.status ?? '—'}] → ${job.data.email}`));
emailQueue.on('completed',(job)  => console.log(`✅ Email job #${job.id} completed`));
emailQueue.on('failed',  (job, err) => console.error(`❌ Email job #${job.id} failed (attempt ${job.attemptsMade}):`, err.message));

const statusTemplates: Record<string, { subject: string; text: (title: string) => string }> = {
  accepted: {
    subject: 'Application Accepted!',
    text: (title) => `Congratulations! Your application for ${title} has been accepted!`,
  },
  rejected: {
    subject: 'Application Update',
    text: (title) => `Thank you for applying to ${title}. Unfortunately we won't be moving forward.`,
  },
  reviewed: {
    subject: 'Application Being Reviewed',
    text: (title) => `Your application for ${title} is currently being reviewed.`,
  },
};

emailQueue.process(async (job) => {
  try {
    const { type, email, jobTitle, status } = job.data;

    let subject: string;
    let text: string;

    if (type === 'status_update') {
      const template = statusTemplates[status];
      if (template) {
        subject = template.subject;
        text = template.text(jobTitle);
      } else {
        subject = 'Application Status Update';
        text = `Your application for ${jobTitle} status has been updated to: ${status}.`;
      }
    } else {
      subject = 'Application Received';
      text = `Thank you for applying to ${jobTitle}! We will get back to you soon.`;
    }

    await transporter.sendMail({
      from: env.nodemailer.user,
      to: email,
      subject,
      text,
    });

    console.log(`✅ Email sent to ${email} [${type ?? 'application_received'} / ${status ?? '—'}]`);
  } catch (error) {
    console.error(`❌ Email failed:`, error);
    throw error;
  }
});
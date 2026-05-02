import emailQueue from "./email.queue";
import nodemailer from "nodemailer";
import { env } from "../config/env";

/**
 * Email worker — processes jobs from the email Bull queue.
 * Runs as a background process — decoupled from the HTTP request cycle.
 * Handles two job types: application_received and status_update.
 */

/**
 * SMTP transporter — connects to the email delivery service.
 * Nodemailer acts as the bridge between your app and the SMTP server.
 * Flow: your app → Nodemailer → SMTP server → recipient's inbox
 */
const transporter = nodemailer.createTransport({
  host: env.nodemailer.host,
  port: env.nodemailer.port,
  secure: false, // STARTTLS used instead of SSL on port 587
  auth: {
    user: env.nodemailer.user,
    pass: env.nodemailer.pass,
  },
});

/**
 * Verify SMTP connection at startup — fail fast pattern.
 * Catches misconfigured credentials immediately instead of
 * discovering them when the first real email tries to send.
 */
transporter.verify((error) => {
  if (error) {
    console.error(`❌ SMTP connection failed (${env.nodemailer.host}:${env.nodemailer.port}):`, error.message);
  } else {
    console.log(`✅ SMTP ready — ${env.nodemailer.host}:${env.nodemailer.port} as ${env.nodemailer.user}`);
  }
});

// ── Queue lifecycle logs ───────────────────────────────────────────────────────
// Logs every job state change regardless of which service enqueued it
emailQueue.on('waiting',   (jobId) => console.log(`📬 Email job #${jobId} added to queue`));
emailQueue.on('active',    (job)   => console.log(`⚙️  Email job #${job.id} processing [${job.data.type}] → ${job.data.email}`));
emailQueue.on('completed', (job)   => console.log(`✅ Email job #${job.id} completed`));
emailQueue.on('failed',    (job, err) => console.error(`❌ Email job #${job.id} failed (attempt ${job.attemptsMade}):`, err.message));

/**
 * Email templates for application status updates.
 * Record<string, {...}> — keyed by status value for clean lookup.
 * Adding a new status only requires adding one entry here.
 * text is a function so jobTitle can be injected dynamically.
 */
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

/**
 * Main worker — processes every job from the email queue.
 * job.data contains what was passed to emailQueue.add() in the service.
 *
 * CRITICAL: throw error in catch block so Bull knows the job failed
 * and triggers retry logic. Without throw, Bull marks it as completed
 * even on failure — email is silently lost.
 */
emailQueue.process(async (job) => {
  try {
    const { type, email, jobTitle, status } = job.data;

    let subject: string;
    let text: string;

    if (type === 'status_update') {
      // Look up template by status — clean alternative to if/else chain
      const template = statusTemplates[status];
      if (template) {
        subject = template.subject;
        text = template.text(jobTitle);
      } else {
        // Fallback for unknown status values
        subject = 'Application Status Update';
        text = `Your application for ${jobTitle} status has been updated to: ${status}.`;
      }
    } else {
      // type === 'application_received' — sent when applicant first applies
      subject = 'Application Received';
      text = `Thank you for applying to ${jobTitle}! We will get back to you soon.`;
    }

    // Send the email via SMTP
    await transporter.sendMail({
      from: env.nodemailer.user,
      to: email,
      subject,
      text,
    });

    console.log(`✅ Email sent to ${email} [${type} / ${status ?? '—'}]`);

  } catch (error) {
    console.error(`❌ Email failed:`, error);
    throw error; // rethrow so Bull marks job as failed and triggers retry
  }
});
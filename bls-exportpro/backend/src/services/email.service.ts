import nodemailer from 'nodemailer';
import { Attachment } from 'nodemailer/lib/mailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Configure based on environment variables
    if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Use a test account for development
      console.log('SMTP not configured. Email service will use console output.');
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const { to, subject, text, html, attachments } = options;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@blsexportpro.com',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html,
      attachments
    };

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
      } catch (error) {
        console.error('Error sending email:', error);
        throw error;
      }
    } else {
      // In development, just log the email
      console.log('=== EMAIL DEBUG ===');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Content:', mailOptions.html || mailOptions.text);
      if (attachments?.length) {
        console.log('Attachments:', attachments.map(a => a.filename).join(', '));
      }
      console.log('==================');
    }
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
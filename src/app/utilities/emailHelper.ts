/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs/promises';
import * as path from 'path';
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import config from '../config';

const sendEmail = async (
  email: string,
  subject: string,
  templateType: 'OTPEmail' | '',
  templateData: Record<string, any> = {}, // 👈 Pass variables like OTP here
  attachment?: { filename: string; content: Buffer; encoding: string },
) => {
  try {
    // Generate email content using the specified template + data
    const html = await createEmailContent(templateType, templateData);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: config.sender_email,
        pass: config.sender_app_password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${config.sender_name || 'No-Reply'}" <${config.sender_email}>`,
      to: email,
      subject,
      html,
      text: Handlebars.compile(
        `Your OTP for password reset is: {{otp}}. This OTP is valid for 15 minutes.`,
      )(templateData), // 👈 Plain text fallback
      attachments: attachment ? [attachment] : [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

const createEmailContent = async (
  templateType: string,
  templateData: Record<string, any> = {},
) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      `/src/templates/${templateType}.template.hbs`,
    );
    const content = await fs.readFile(templatePath, 'utf8');

    const template = Handlebars.compile(content);
    return template(templateData); // 👈 Inject data here
  } catch (error) {
    console.error('Error creating email content:', error);
    throw new Error('Failed to create email content');
  }
};

export const EmailHelper = {
  sendEmail,
  createEmailContent,
};

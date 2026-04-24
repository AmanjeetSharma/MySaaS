import nodemailer from "nodemailer";
import env from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Send Email Utility
 * @param {string} to - receiver email
 * @param {string} subject - email subject
 * @param {string} content - text or HTML content
 * @param {boolean} isHtml - true if HTML content
 */

export const sendEmail = async (to, subject, content, isHtml = false) => {
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            host: env.SMTP_HOST, // e.g. smtp.gmail.com
            port: env.SMTP_PORT, // 587 or 465
            secure: env.SMTP_PORT == 465, // true for 465
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
        });

        // Mail options
        const mailOptions = {
            from: `"MySaaS" <${env.SMTP_USER}>`,
            to,
            subject,
            ...(isHtml ? { html: content } : { text: content }),
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log(`Email sent to ${to} | Subject: ${subject} | Message ID: ${info.messageId}`);

        return info;
    } catch (error) {
        throw new ApiError(500, "Email could not be sent", error.message);
    }
};


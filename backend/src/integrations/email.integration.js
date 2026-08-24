import nodemailer from "nodemailer";
import env from "../config/env.config.js";
import { ApiError } from "../utils/ApiError.js";
import logger from "../config/logger.js";

const log = logger.child({ module: "email.integration" });

/**
 * Send Email Utility
 * @param {string} to - receiver email
 * @param {string} subject - email subject
 * @param {string} content - text or HTML content
 * @param {boolean} isHtml - true if HTML content
 */


export const sendEmail = async (
    to,
    subject,
    content,
    isHtml = false
) => {
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_PORT == 465,
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
            ...(isHtml
                ? { html: content }
                : { text: content }),
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        log.info(
            {
                to,
                subject,
                messageId: info.messageId,
            },
            "Email sent successfully"
        );

        return info;

    } catch (error) {
        log.error(
            {
                err: error,
                to,
                subject,
            },
            "Email sending failed"
        );

        throw new ApiError(500, "Email could not be sent", error.message);
    }
};


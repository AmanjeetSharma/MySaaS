// bookingConfirmationBookerEmailTemplate.js

export const bookingConfirmationBookerEmailTemplate = ({
    bookerName,
    organizationName,
    serviceName,
    date,
    durationInMinutes,
    mode,
    address,
    meetingLink,
    manageBookingUrl,
}) => {
    const locationContent =
        mode === "OFFLINE" && address
            ? `
                <div class="detail-row">
                    <div class="detail-label">Location</div>
                    <div class="detail-value">
                        ${address.street ? `${address.street}, ` : ""}
                        ${address.city ? `${address.city}, ` : ""}
                        ${address.state ? `${address.state}, ` : ""}
                        ${address.country ? address.country : ""}
                        ${address.zipCode ? ` - ${address.zipCode}` : ""}
                    </div>
                </div>
            `
            : "";

    const meetingContent =
        meetingLink
            ? `
                <div class="button-container">
                    <a href="${meetingLink}" class="primary-button">
                        Join Google Meet
                    </a>
                </div>

                <div class="alt-link">
                    Or copy and paste this link into your browser:<br>
                    <a href="${meetingLink}">${meetingLink}</a>
                </div>
            `
            : "";

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmed - MySaaS</title>

            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
                    background-color: #1a1a1a;
                    line-height: 1.6;
                }

                .container {
                    max-width: 560px;
                    margin: 40px auto;
                    padding: 20px;
                }

                .email-card {
                    background-color: #2d2d2d;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    border: 1px solid #3d3d3d;
                }

                .header {
                    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                    padding: 30px;
                    text-align: center;
                    border-bottom: 3px solid #39ff14;
                }

                .logo {
                    font-size: 32px;
                    font-weight: bold;
                    color: #39ff14;
                    margin-bottom: 5px;
                }

                .logo span {
                    color: #ffffff;
                    font-weight: normal;
                }

                .tagline {
                    color: #a0a0a0;
                    font-size: 12px;
                }

                .content {
                    padding: 30px;
                }

                .greeting {
                    font-size: 22px;
                    color: #ffffff;
                    margin-bottom: 15px;
                    font-weight: 600;
                }

                .greeting span {
                    color: #39ff14;
                }

                .message {
                    color: #b0b0b0;
                    font-size: 15px;
                    margin-bottom: 25px;
                }

                .booking-card {
                    background-color: #1a1a1a;
                    border: 1px solid #3d3d3d;
                    border-radius: 10px;
                    padding: 20px;
                    margin: 25px 0;
                }

                .booking-title {
                    color: #ffffff;
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 15px;
                }

                .detail-row {
                    margin: 12px 0;
                }

                .detail-label {
                    color: #888888;
                    font-size: 12px;
                    text-transform: uppercase;
                }

                .detail-value {
                    color: #ffffff;
                    font-size: 15px;
                    margin-top: 2px;
                }

                .button-container {
                    text-align: center;
                    margin: 25px 0;
                }

                .primary-button {
                    display: inline-block;
                    background: #39ff14;
                    color: #000000 !important;
                    text-decoration: none;
                    padding: 12px 28px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 15px;
                }

                .secondary-button {
                    display: inline-block;
                    background: #333333;
                    color: #ffffff !important;
                    text-decoration: none;
                    padding: 12px 28px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 15px;
                    border: 1px solid #444444;
                }

                .alt-link {
                    text-align: center;
                    margin: 15px 0;
                    font-size: 12px;
                    color: #888888;
                }

                .alt-link a {
                    color: #39ff14;
                    text-decoration: none;
                    word-break: break-all;
                }

                .info-box {
                    background-color: #1a1a1a;
                    border-left: 4px solid #39ff14;
                    padding: 12px 16px;
                    margin: 20px 0;
                    border-radius: 8px;
                }

                .info-text {
                    color: #b0b0b0;
                    font-size: 13px;
                    margin: 0;
                }

                .info-text strong {
                    color: #39ff14;
                }

                .footer {
                    background-color: #1a1a1a;
                    padding: 20px;
                    text-align: center;
                    border-top: 1px solid #3d3d3d;
                }

                .footer-text {
                    color: #888888;
                    font-size: 12px;
                    margin: 5px 0;
                }

                @media only screen and (max-width: 480px) {
                    .container {
                        padding: 10px;
                    }

                    .content {
                        padding: 20px;
                    }
                }
            </style>
        </head>

        <body>
            <div class="container">
                <div class="email-card">

                    <div class="header">
                        <div class="logo">
                            My<span>SaaS</span>
                        </div>

                        <div class="tagline">
                            Next-Generation CRM for Modern Businesses
                        </div>
                    </div>

                    <div class="content">

                        <div class="greeting">
                            Hi <span>${bookerName}</span>! 🎉
                        </div>

                        <div class="message">
                            Your booking with <strong style="color:#ffffff;">
                                ${organizationName}
                            </strong>
                            has been confirmed successfully.
                        </div>

                        <div class="booking-card">

                            <div class="booking-title">
                                ${serviceName}
                            </div>

                            <div class="detail-row">
                                <div class="detail-label">Date & Time</div>
                                <div class="detail-value">
                                    ${date}
                                </div>
                            </div>

                            <div class="detail-row">
                                <div class="detail-label">Duration</div>
                                <div class="detail-value">
                                    ${durationInMinutes} minutes
                                </div>
                            </div>

                            <div class="detail-row">
                                <div class="detail-label">Type</div>
                                <div class="detail-value">
                                    ${mode}
                                </div>
                            </div>

                            ${locationContent}

                        </div>

                        ${meetingContent}

                        <div class="button-container">
                            <a href="${manageBookingUrl}" class="secondary-button">
                                Manage Booking
                            </a>
                        </div>

                        <div class="alt-link">
                            If the button doesn't work, copy and paste this link:<br>
                            <a href="${manageBookingUrl}">
                                ${manageBookingUrl}
                            </a>
                        </div>

                        <div class="info-box">
                            <p class="info-text">
                                🔐 <strong>Keep this email safe.</strong>
                                Your manage booking link gives access to your booking.
                            </p>
                        </div>

                    </div>

                    <div class="footer">
                        <p class="footer-text">
                            © 2026 MySaaS. All rights reserved.
                        </p>

                        <p class="footer-text">
                            This is an automated message. Please do not reply directly to this email.
                        </p>
                    </div>

                </div>
            </div>
        </body>
        </html>
    `;
};
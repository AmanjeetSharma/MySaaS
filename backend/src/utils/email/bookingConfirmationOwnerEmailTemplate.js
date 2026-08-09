// bookingConfirmationOwnerEmailTemplate.js

export const bookingConfirmationOwnerEmailTemplate = ({
    ownerName,
    organizationName,
    serviceName,
    bookerName,
    bookerEmail,
    bookerPhone,
    date,
    durationInMinutes,
    mode,
    address,
    meetingLink,
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
                        Open Google Meet
                    </a>
                </div>
            `
            : "";

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Booking - MySaaS</title>

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
                }

                .logo span {
                    color: #ffffff;
                    font-weight: normal;
                }

                .tagline {
                    color: #a0a0a0;
                    font-size: 12px;
                    margin-top: 5px;
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

                .section-title {
                    color: #39ff14;
                    font-size: 13px;
                    text-transform: uppercase;
                    font-weight: 700;
                    margin-top: 20px;
                    margin-bottom: 10px;
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
                            Hi <span>${ownerName || "there"}</span>! 📅
                        </div>

                        <div class="message">
                            You have received a new booking for
                            <strong style="color:#ffffff;">
                                ${organizationName}
                            </strong>.
                        </div>

                        <div class="booking-card">

                            <div class="booking-title">
                                ${serviceName}
                            </div>

                            <div class="section-title">
                                Appointment
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

                            <div class="section-title">
                                Customer
                            </div>

                            <div class="detail-row">
                                <div class="detail-label">Name</div>
                                <div class="detail-value">
                                    ${bookerName}
                                </div>
                            </div>

                            <div class="detail-row">
                                <div class="detail-label">Email</div>
                                <div class="detail-value">
                                    ${bookerEmail}
                                </div>
                            </div>

                            ${bookerPhone
            ? `
                                        <div class="detail-row">
                                            <div class="detail-label">Phone</div>
                                            <div class="detail-value">
                                                ${bookerPhone}
                                            </div>
                                        </div>
                                    `
            : ""
        }

                        </div>

                        ${meetingContent}

                        <div class="info-box">
                            <p class="info-text">
                                This booking has been added to the organization's
                                configured Google Calendar when Google Calendar
                                integration is enabled.
                            </p>
                        </div>

                    </div>

                    <div class="footer">
                        <p class="footer-text">
                            © 2026 MySaaS. All rights reserved.
                        </p>

                        <p class="footer-text">
                            This is an automated booking notification.
                        </p>
                    </div>

                </div>
            </div>
        </body>
        </html>
    `;
};
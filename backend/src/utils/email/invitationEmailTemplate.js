import env from "#/config/env.config.js";

const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

export const invitationEmailTemplate = (inviterName, organizationName) => {
    const signupUrl = `${env.CLIENT_URL}/signup`;

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invitation to join ${escapeHtml(organizationName)}</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background-color: #f4f5f7;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    color: #333333;
                    line-height: 1.6;
                }
                .wrapper {
                    width: 100%;
                    background-color: #f4f5f7;
                    padding: 40px 0;
                }
                .card {
                    max-width: 520px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border: 1px solid #e1e4e8;
                    border-radius: 6px;
                    padding: 40px;
                    box-sizing: border-box;
                }
                .brand {
                    font-size: 18px;
                    font-weight: 700;
                    color: #111827;
                    margin-bottom: 24px;
                    letter-spacing: -0.5px;
                }
                .heading {
                    font-size: 20px;
                    font-weight: 600;
                    color: #111827;
                    margin: 0 0 16px 0;
                }
                .body-text {
                    font-size: 15px;
                    color: #4b5563;
                    margin: 0 0 16px 0;
                }
                .button-container {
                    margin: 28px 0;
                }
                .cta-button {
                    display: inline-block;
                    background-color: #1f2937;
                    color: #ffffff !important;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    padding: 10px 22px;
                    border-radius: 5px;
                }
                .alt-link {
                    font-size: 13px;
                    color: #6b7280;
                    word-break: break-all;
                    margin-top: 24px;
                }
                .alt-link a {
                    color: #2563eb;
                    text-decoration: none;
                }
                .footer {
                    margin-top: 32px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    font-size: 12px;
                    color: #9ca3af;
                }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="card">
                    <div class="brand">miniCRM</div>

                    <h1 class="heading">You've been invited to collaborate</h1>

                    <p class="body-text">
                        <strong>${escapeHtml(inviterName)}</strong> has invited you to join the 
                        <strong>${escapeHtml(organizationName)}</strong> workspace on miniCRM.
                    </p>

                    <p class="body-text">
                        To get started, create your account using the email address this invitation was sent to.
                    </p>

                    <div class="button-container">
                        <a href="${signupUrl}" class="cta-button">Create Your Account</a>
                    </div>

                    <div class="alt-link">
                        Button not working? Navigate directly to:<br>
                        <a href="${signupUrl}">${signupUrl}</a>
                    </div>

                    <div class="footer">
                        If you were not expecting this invitation, you can safely disregard this email.
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};
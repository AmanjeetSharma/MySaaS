export const resetEmailTemplate = (name, resetUrl) => {
    const recipientName = name || "there";

    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F9FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8F9FA; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #FFFFFF; border: 1px solid #DADCE0; border-radius: 8px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td align="left" style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #F1F3F4;">
              <span style="font-size: 20px; font-weight: 600; color: #202124; letter-spacing: -0.2px;">MySaaS</span>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #202124; line-height: 1.4;">
                Reset your password
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #3C4043;">
                Hi ${recipientName}, we received a request to reset the password for your MySaaS account. Click the button below to choose a new password.
              </p>

              <!-- Action Button -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: #1A73E8;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 10px 24px; font-size: 14px; font-weight: 500; color: #FFFFFF; text-decoration: none; border-radius: 4px; border: 1px solid #1A73E8;">
                      Reset password &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct Link -->
              <p style="margin: 0 0 24px 0; font-size: 12px; line-height: 1.5; color: #70757A;">
                If the button above does not work, copy and paste this link into your browser:<br />
                <a href="${resetUrl}" style="color: #1A73E8; text-decoration: underline; word-break: break-all;">${resetUrl}</a>
              </p>

              <!-- Expiry & Security Notice -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="border-top: 1px solid #F1F3F4; padding-top: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; color: #70757A;">
                      This link will expire in 10 minutes for your security.
                    </p>
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #70757A;">
                        If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged. If you suspect unauthorized activity or believe someone may be trying to access your account, please contact our support team immediately.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; margin-top: 16px;">
          <tr>
            <td align="center" style="padding: 0 16px; font-size: 12px; line-height: 1.5; color: #70757A;">
              <p style="margin: 0;">
                &copy; 2026 MySaaS Inc. Automated security notification, please do not reply.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
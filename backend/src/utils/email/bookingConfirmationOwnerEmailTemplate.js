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
  const recipientName = ownerName || "there";
  const formattedAddress = address
    ? [address.street, address.city, address.state, address.country, address.zipCode]
        .filter(Boolean)
        .join(", ")
    : "";

  const locationRow =
    mode === "OFFLINE" && formattedAddress
      ? `
        <tr>
          <td style="padding: 10px 0; border-top: 1px solid #EEF2F6; font-size: 13px; color: #6B7280; font-weight: 500;">Location</td>
          <td style="padding: 10px 0; border-top: 1px solid #EEF2F6; font-size: 13px; color: #1F2937; text-align: right; font-weight: 500;">${formattedAddress}</td>
        </tr>
      `
      : "";

  const phoneRow = bookerPhone
    ? `
      <tr>
        <td style="padding: 10px 0; border-top: 1px solid #EEF2F6; font-size: 13px; color: #6B7280; font-weight: 500;">Phone</td>
        <td style="padding: 10px 0; border-top: 1px solid #EEF2F6; font-size: 13px; color: #1F2937; text-align: right; font-weight: 500;">${bookerPhone}</td>
      </tr>
    `
    : "";

  const meetingAction = meetingLink
    ? `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 24px 0;">
        <tr>
          <td align="center" style="border-radius: 6px; background-color: #4F46E5;">
            <a href="${meetingLink}" target="_blank" style="display: block; padding: 11px 24px; font-size: 14px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 6px; border: 1px solid #4F46E5; text-align: center;">
              Open Meeting &rarr;
            </a>
          </td>
        </tr>
      </table>
    `
    : "";

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Booking Scheduled</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F9FAFB; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Container Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
          
          <!-- Indigo Brand Accent Top Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%); line-height: 4px; font-size: 4px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="left" style="padding: 24px 32px 18px 32px; border-bottom: 1px solid #F3F4F6;">
              <span style="font-size: 18px; font-weight: 700; color: #4338CA; letter-spacing: -0.2px;">${organizationName || "MySaaS"}</span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #111827; line-height: 1.3;">
                New booking scheduled
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: #4B5563;">
                Hi ${recipientName}, a client has booked an appointment for <strong>${serviceName}</strong>.
              </p>

              <!-- Appointment Overview -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 6px; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 11px; font-weight: 700; color: #4338CA; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">Appointment Details</div>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #6B7280; font-weight: 500;">Service</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #111827; text-align: right; font-weight: 600;">${serviceName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #EEF2F6; font-size: 13px; color: #6B7280; font-weight: 500;">Date & Time</td>
                        <td style="padding: 10px 0; border-top: 1px solid #EEF2F6; font-size: 13px; color: #4F46E5; text-align: right; font-weight: 600;">${date}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #EEF2F6; font-size: 13px; color: #6B7280; font-weight: 500;">Duration</td>
                        <td style="padding: 10px 0; border-top: 1px solid #EEF2F6; font-size: 13px; color: #1F2937; text-align: right; font-weight: 500;">${durationInMinutes} mins</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #EEF2F6; font-size: 13px; color: #6B7280; font-weight: 500;">Format</td>
                        <td style="padding: 10px 0; border-top: 1px solid #EEF2F6; font-size: 13px; color: #1F2937; text-align: right; font-weight: 500;">${mode}</td>
                      </tr>
                      ${locationRow}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Customer Details -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 6px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">Customer Information</div>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #6B7280; font-weight: 500;">Name</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #111827; text-align: right; font-weight: 600;">${bookerName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #EEF2F6; font-size: 13px; color: #6B7280; font-weight: 500;">Email</td>
                        <td style="padding: 10px 0; border-top: 1px solid #EEF2F6; font-size: 13px; color: #4F46E5; text-align: right; font-weight: 500;">${bookerEmail}</td>
                      </tr>
                      ${phoneRow}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              ${meetingAction}

              <!-- Calendar Sync Notice -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="border-top: 1px solid #F3F4F6; padding-top: 16px;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #6B7280;">
                      This event syncs automatically to your connected Google Calendar.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- Outer Minimal Footer -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; margin-top: 16px;">
          <tr>
            <td align="center" style="padding: 0 16px; font-size: 12px; line-height: 1.5; color: #9CA3AF;">
              <p style="margin: 0;">
                &copy; 2026 ${organizationName || "MySaaS"}. Automated internal booking alert.
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
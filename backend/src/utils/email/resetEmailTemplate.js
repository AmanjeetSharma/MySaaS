export const resetEmailTemplate = (name, resetUrl) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Password - MySaaS CRM</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
                    background-color: #1a1a1a;
                    line-height: 1.6;
                }
                
                .container {
                    max-width: 500px;
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
                    text-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
                }
                
                .logo span {
                    color: #ffffff;
                    font-weight: normal;
                }
                
                .tagline {
                    color: #a0a0a0;
                    font-size: 12px;
                    margin-top: 8px;
                }
                
                .content {
                    padding: 30px;
                }
                
                .greeting {
                    font-size: 22px;
                    color: #ffffff;
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                
                .greeting span {
                    color: #39ff14;
                }
                
                .message {
                    color: #b0b0b0;
                    margin-bottom: 25px;
                    font-size: 16px;
                }
                
                .button-container {
                    text-align: center;
                    margin: 30px 0;
                }
                
                .reset-button {
                    display: inline-block;
                    background: #39ff14;
                    color: #000000 !important;
                    text-decoration: none;
                    padding: 12px 28px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 16px;
                    transition: all 0.2s;
                    box-shadow: 0 0 15px rgba(57, 255, 20, 0.3);
                    border: none;
                }
                
                .reset-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0 25px rgba(57, 255, 20, 0.5);
                    background: #2ee010;
                }
                
                .alt-link {
                    text-align: center;
                    margin: 20px 0;
                    font-size: 13px;
                    color: #888888;
                }
                
                .alt-link a {
                    color: #39ff14;
                    text-decoration: none;
                    word-break: break-all;
                }
                
                .alt-link a:hover {
                    text-decoration: underline;
                }
                
                .info-box {
                    background-color: #1a1a1a;
                    border-left: 4px solid #39ff14;
                    padding: 12px 16px;
                    margin: 20px 0;
                    border-radius: 8px;
                }
                
                .info-text {
                    color: #39ff14;
                    font-size: 13px;
                    margin: 0;
                }
                
                .security-note {
                    background-color: #222222;
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin: 20px 0;
                    border: 1px solid #3d3d3d;
                }
                
                .security-note p {
                    color: #b0b0b0;
                    font-size: 13px;
                    margin: 0;
                }
                
                .security-note strong {
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
                
                .social-links {
                    margin: 10px 0;
                }
                
                .social-links a {
                    color: #39ff14;
                    text-decoration: none;
                    margin: 0 10px;
                    font-size: 11px;
                }
                
                .social-links a:hover {
                    text-decoration: underline;
                }
                
                @media only screen and (max-width: 480px) {
                    .container {
                        padding: 10px;
                    }
                    
                    .content {
                        padding: 20px;
                    }
                    
                    .reset-button {
                        padding: 10px 20px;
                        font-size: 14px;
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
                            Hi <span>${name}</span>! 🔐
                        </div>
                        
                        <div class="message">
                            We received a request to reset the password for your MySaaS CRM account. 
                            Click the button below to create a new password and secure your account.
                        </div>
                        
                        <div class="button-container">
                            <a href="${resetUrl}" class="reset-button">
                                Reset Password
                            </a>
                        </div>
                        
                        <div class="alt-link">
                            Or copy and paste this link into your browser:<br>
                            <a href="${resetUrl}">${resetUrl}</a>
                        </div>
                        
                        <div class="info-box">
                            <p class="info-text">
                                ⏳ <strong>This link will expire in 10 minutes</strong> for your security.
                                If you didn't request a password reset, you can safely ignore this email.
                            </p>
                        </div>
                        
                        <div class="security-note">
                            <p>
                                🔒 <strong>Security Tip:</strong> Never share this link with anyone. 
                                MySaaS CRM will never ask for your password via email or phone.
                            </p>
                        </div>
                        
                        <div class="message" style="font-size: 13px; margin-top: 20px; color: #888888;">
                            For additional security, we recommend enabling two-factor authentication 
                            after logging into your account.
                        </div>
                    </div>
                    
                    <div class="footer">
                        <div class="social-links">
                            <a href="#">About</a> •
                            <a href="#">Privacy</a> •
                            <a href="#">Terms</a> •
                            <a href="#">Support</a>
                        </div>
                        <p class="footer-text">
                            © 2024 MySaaS CRM. All rights reserved.<br>
                            Empowering businesses with intelligent CRM solutions
                        </p>
                        <p class="footer-text" style="font-size: 11px;">
                            This is an automated message, please do not reply to this email.<br>
                            For assistance, contact support@mysaascrm.com
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};
// emailTemplates.js
export const registerEmailTemplate = (name, url) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - MySaaS CRM</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
                    background-color: #1a1a1a;
                    line-height: 1.6;
                }
                
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                .email-wrapper {
                    background-color: #2d2d2d;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    border: 1px solid #3d3d3d;
                }
                
                .header {
                    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                    padding: 40px 30px;
                    text-align: center;
                    border-bottom: 3px solid #39ff14;
                }
                
                .logo {
                    font-size: 32px;
                    font-weight: bold;
                    color: #39ff14;
                    margin-bottom: 10px;
                    text-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
                }
                
                .logo span {
                    color: #ffffff;
                    font-weight: normal;
                }
                
                .tagline {
                    color: #a0a0a0;
                    font-size: 14px;
                    margin-top: 8px;
                }
                
                .content {
                    padding: 40px 30px;
                }
                
                .greeting {
                    font-size: 24px;
                    color: #ffffff;
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                
                .greeting span {
                    color: #39ff14;
                }
                
                .message {
                    color: #b0b0b0;
                    margin-bottom: 20px;
                    font-size: 16px;
                }
                
                .button-container {
                    text-align: center;
                    margin: 35px 0;
                }
                
                .verify-button {
                    display: inline-block;
                    background: #39ff14;
                    color: #000000 !important;
                    text-decoration: none;
                    padding: 14px 32px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 16px;
                    transition: all 0.2s;
                    box-shadow: 0 0 15px rgba(57, 255, 20, 0.3);
                    border: none;
                }
                
                .verify-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0 25px rgba(57, 255, 20, 0.5);
                    background: #2ee010;
                }
                
                .alt-link {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 14px;
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
                
                .steps-container {
                    background-color: #222222;
                    padding: 20px;
                    margin: 25px 0;
                    border-radius: 12px;
                    border-left: 3px solid #39ff14;
                }
                
                .step-item {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 16px;
                    color: #b0b0b0;
                    font-size: 14px;
                }
                
                .step-number {
                    background: #39ff14;
                    color: #000000;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    margin-right: 12px;
                    flex-shrink: 0;
                }
                
                .step-text {
                    flex: 1;
                    color: #cccccc;
                }
                
                .step-text strong {
                    color: #39ff14;
                }
                
                .info-box {
                    background-color: #1a1a1a;
                    border-left: 4px solid #39ff14;
                    padding: 15px 20px;
                    margin: 25px 0;
                    border-radius: 8px;
                }
                
                .info-text {
                    color: #39ff14;
                    font-size: 14px;
                    margin: 0;
                    font-weight: 500;
                }
                
                .features {
                    background-color: #222222;
                    border-radius: 8px;
                    padding: 15px 20px;
                    margin: 20px 0;
                    border: 1px solid #3d3d3d;
                }
                
                .features-title {
                    font-weight: 600;
                    color: #39ff14;
                    margin-bottom: 10px;
                    font-size: 14px;
                }
                
                .features-list {
                    margin: 0;
                    padding-left: 20px;
                    color: #b0b0b0;
                    font-size: 13px;
                }
                
                .features-list li {
                    margin-bottom: 6px;
                }
                
                .footer {
                    background-color: #1a1a1a;
                    padding: 25px 30px;
                    text-align: center;
                    border-top: 1px solid #3d3d3d;
                }
                
                .footer-text {
                    color: #888888;
                    font-size: 12px;
                    margin: 5px 0;
                }
                
                .social-links {
                    margin: 15px 0;
                }
                
                .social-links a {
                    color: #39ff14;
                    text-decoration: none;
                    margin: 0 10px;
                    font-size: 12px;
                }
                
                .social-links a:hover {
                    text-decoration: underline;
                }
                
                @media only screen and (max-width: 480px) {
                    .content {
                        padding: 30px 20px;
                    }
                    
                    .header {
                        padding: 30px 20px;
                    }
                    
                    .verify-button {
                        padding: 12px 24px;
                        font-size: 14px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="email-wrapper">
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
                            Welcome to MySaaS, <span>${name}</span>! 🚀
                        </div>
                        
                        <div class="message">
                            You're just one step away from streamlining your customer relationships and growing your business. 
                            Click the button below to verify your email and activate your MySaaS CRM account.
                        </div>
                        
                        <div class="button-container">
                            <a href="${url}" class="verify-button">
                                ✓ Verify Email & Activate Account
                            </a>
                        </div>
                        
                        <div class="alt-link">
                            Or copy and paste this link into your browser:<br>
                            <a href="${url}">${url}</a>
                        </div>
                        
                        <div class="steps-container">
                            <div class="step-item">
                                <span class="step-number">1</span>
                                <span class="step-text"><strong>Verify Your Email</strong> - Click the button above to confirm your email address</span>
                            </div>
                            <div class="step-item">
                                <span class="step-number">2</span>
                                <span class="step-text"><strong>Set Up Your Workspace</strong> - Customize your CRM dashboard and settings</span>
                            </div>
                            <div class="step-item">
                                <span class="step-number">3</span>
                                <span class="step-text"><strong>Start Managing Leads</strong> - Add your first contacts and track deals</span>
                            </div>
                        </div>
                        
                        <div class="features">
                            <div class="features-title">✨ What You'll Get With MySaaS CRM:</div>
                            <ul class="features-list">
                                <li>Centralized customer database and contact management</li>
                                <li>Sales pipeline tracking and deal management</li>
                                <li>Task and activity logging for follow-ups</li>
                                <li>Email integration and communication history</li>
                                <li>Real-time analytics and performance reports</li>
                                <li>Mobile-responsive dashboard for on-the-go access</li>
                            </ul>
                        </div>
                        
                        <div class="info-box">
                            <p class="info-text">
                                ⏰ <strong>Verification Link Expires in 24 Hours</strong><br>
                                Please verify your email within 24 hours to activate your MySaaS CRM account.
                            </p>
                        </div>
                        
                        <div class="message" style="font-size: 14px; margin-top: 20px; background-color: #1a1a1a; padding: 12px; border-radius: 8px; border: 1px solid #3d3d3d;">
                            🔒 <strong>Didn't sign up for MySaaS?</strong><br>
                            If you didn't request this email, you can safely ignore it. No account will be created until you verify.
                        </div>
                    </div>
                    
                    <div class="footer">
                        <div class="social-links">
                            <a href="#">About MySaaS</a> •
                            <a href="#">Privacy Policy</a> •
                            <a href="#">Terms of Service</a> •
                            <a href="#">Support</a>
                        </div>
                        <p class="footer-text">
                            © 2024 MySaaS CRM. All rights reserved.<br>
                            Empowering businesses with intelligent CRM solutions
                        </p>
                        <p class="footer-text" style="font-size: 11px;">
                            This is an automated verification email. Please do not reply.<br>
                            For assistance, contact us at support@mysaascrm.com
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

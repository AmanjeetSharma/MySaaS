export const welcomeEmailTemplate = (name) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to MySaaS CRM</title>
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
                
                .getting-started {
                    background-color: #222222;
                    padding: 20px;
                    margin: 25px 0;
                    border-radius: 12px;
                    border-left: 3px solid #39ff14;
                }
                
                .section-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #39ff14;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .feature-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin: 20px 0;
                }
                
                .feature-card {
                    background: #1a1a1a;
                    padding: 15px;
                    border-radius: 10px;
                    border: 1px solid #3d3d3d;
                    transition: transform 0.2s, border-color 0.2s;
                }
                
                .feature-card:hover {
                    border-color: #39ff14;
                    transform: translateY(-2px);
                }
                
                .feature-icon {
                    font-size: 24px;
                    margin-bottom: 8px;
                }
                
                .feature-title {
                    font-weight: 600;
                    color: #39ff14;
                    margin-bottom: 5px;
                    font-size: 14px;
                }
                
                .feature-desc {
                    color: #888888;
                    font-size: 12px;
                }
                
                .button-container {
                    text-align: center;
                    margin: 35px 0;
                }
                
                .action-button {
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
                
                .action-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0 25px rgba(57, 255, 20, 0.5);
                    background: #2ee010;
                }
                
                .tip-box {
                    background-color: #1a1a1a;
                    border-left: 4px solid #39ff14;
                    padding: 15px 20px;
                    margin: 25px 0;
                    border-radius: 8px;
                }
                
                .tip-text {
                    color: #39ff14;
                    font-size: 14px;
                    margin: 0;
                }
                
                .stats-box {
                    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                    border-radius: 12px;
                    padding: 20px;
                    margin: 25px 0;
                    text-align: center;
                    border: 1px solid #39ff14;
                }
                
                .stats-number {
                    font-size: 32px;
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: #39ff14;
                }
                
                .stats-label {
                    font-size: 12px;
                    color: #a0a0a0;
                }
                
                .stats-row {
                    display: flex;
                    justify-content: space-around;
                    margin-top: 15px;
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
                    
                    .feature-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .action-button {
                        padding: 12px 24px;
                        font-size: 14px;
                    }
                    
                    .stats-row {
                        flex-direction: column;
                        gap: 15px;
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
                            Welcome aboard, <span>${name || "Business Partner"}!</span> 🎉
                        </div>;
                        
                        <div class="message">
                            Thank you for choosing MySaaS CRM! We're excited to help you streamline your customer relationships and grow your business. 
                            Your journey to better sales management and higher productivity starts now.
                        </div>
                        
                        <div class="getting-started">
                            <div class="section-title">
                                🚀 Get Started in 3 Easy Steps
                            </div>
                            <div class="feature-grid">
                                <div class="feature-card">
                                    <div class="feature-icon">🏢</div>
                                    <div class="feature-title">Set Up Your Workspace</div>
                                    <div class="feature-desc">Customize your CRM dashboard and company settings</div>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon">👥</div>
                                    <div class="feature-title">Import Contacts</div>
                                    <div class="feature-desc">Add your customers, leads, and business partners</div>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon">📈</div>
                                    <div class="feature-title">Create Sales Pipeline</div>
                                    <div class="feature-desc">Set up deal stages and track opportunities</div>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon">📊</div>
                                    <div class="feature-title">Track Analytics</div>
                                    <div class="feature-desc">Monitor performance with real-time reports</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="button-container">
                            <a href="${process.env.CLIENT_URL}/dashboard" class="action-button">
                                Go to Your Dashboard →
                            </a>
                        </div>
                        
                        <div class="tip-box">
                            <p class="tip-text">
                                💡 <strong>Pro Tip:</strong> Complete your workspace setup within the next 24 hours to unlock 
                                advanced features like email integration and automated follow-ups!
                            </p>
                        </div>
                        
                        <div class="message" style="font-size: 14px; margin-top: 20px;">
                            <strong>Here's what you can do with MySaaS CRM:</strong>
                        </div>
                        
                        <div style="margin: 15px 0;">
                            <div style="margin-bottom: 12px; color: #b0b0b0;">
                                ✅ <strong style="color: #39ff14;">Centralize Customer Data</strong> - All your contacts in one place
                            </div>
                            <div style="margin-bottom: 12px; color: #b0b0b0;">
                                ✅ <strong style="color: #39ff14;">Track Deals & Opportunities</strong> - Never miss a sales opportunity
                            </div>
                            <div style="margin-bottom: 12px; color: #b0b0b0;">
                                ✅ <strong style="color: #39ff14;">Schedule Tasks & Follow-ups</strong> - Stay on top of your activities
                            </div>
                            <div style="margin-bottom: 12px; color: #b0b0b0;">
                                ✅ <strong style="color: #39ff14;">Generate Reports</strong> - Data-driven insights for better decisions
                            </div>
                            <div style="margin-bottom: 12px; color: #b0b0b0;">
                                ✅ <strong style="color: #39ff14;">Collaborate with Team</strong> - Share leads and manage together
                            </div>
                        </div>
                        
                        <div class="stats-box">
                            <div class="stats-row">
                                <div>
                                    <div class="stats-number">5000+</div>
                                    <div class="stats-label">Businesses Using MySaaS</div>
                                </div>
                                <div>
                                    <div class="stats-number">98%</div>
                                    <div class="stats-label">Customer Satisfaction</div>
                                </div>
                                <div>
                                    <div class="stats-number">3x</div>
                                    <div class="stats-label">Faster Lead Response</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="message" style="font-size: 14px; background-color: #1a1a1a; padding: 12px; border-radius: 8px; margin-top: 20px; border: 1px solid #3d3d3d;">
                            📞 <strong style="color: #39ff14;">Need Help?</strong> Our support team is here to assist you 24/7. 
                            Contact us at <a href="mailto:support@mysaascrm.com" style="color: #39ff14;">support@mysaascrm.com</a>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <div class="social-links">
                            <a href="#">About MySaaS</a> •
                            <a href="#">Blog</a> •
                            <a href="#">Documentation</a> •
                            <a href="#">Privacy Policy</a> •
                            <a href="#">Terms of Service</a> •
                            <a href="#">Contact Support</a>
                        </div>
                        <p class="footer-text">
                            © 2024 MySaaS CRM. All rights reserved.<br>
                            Empowering businesses with intelligent CRM solutions
                        </p>
                        <p class="footer-text" style="font-size: 11px;">
                            You're receiving this email because you registered with MySaaS CRM.<br>
                            If you have any questions, feel free to reach out to our support team.
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

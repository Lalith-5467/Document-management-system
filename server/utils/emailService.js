const nodemailer = require('nodemailer');

// Create Nodemailer SMTP Transporter
const createTransporter = () => {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '465');
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465 || process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
        tls: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Send Professional Email OTP via SMTP
 * @param {string} toEmail 
 * @param {string} otpCode 
 */
const sendOtpEmail = async (toEmail, otpCode) => {
    const from = process.env.SMTP_FROM || '"DocVault Security" <lalitharasi496@gmail.com>';
    const subject = `🔒 ${otpCode} is your DocVault verification code`;
    
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DocVault Email Verification</title>
    </head>
    <body style="margin:0; padding:0; background-color:#FAF8F4; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
        
        <!-- Main Email Wrapper -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#FAF8F4; padding:30px 15px;">
            <tr>
                <td align="center">
                    
                    <!-- Container Card -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px; background-color:#ffffff; border-radius:24px; border:1px solid #E8E1D5; box-shadow:0 15px 40px rgba(40,30,15,0.06); overflow:hidden;">
                        
                        <!-- Header Banner -->
                        <tr>
                            <td align="center" style="background: linear-gradient(135deg, #FF6B00 0%, #E05500 100%); padding: 36px 30px; text-align: center;">
                                <!-- Logo Icon Badge -->
                                <table border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center" style="background-color:rgba(255,255,255,0.2); border-radius:18px; padding:12px; width:44px; height:44px;">
                                            <span style="font-size:26px; line-height:1;">🛡️</span>
                                        </td>
                                    </tr>
                                </table>
                                <h1 style="color:#ffffff; font-size:28px; font-weight:800; margin:14px 0 4px 0; tracking-tight: -0.5px;">DocVault</h1>
                                <p style="color:rgba(255,255,255,0.9); font-size:13px; font-weight:500; margin:0; letter-spacing:0.5px; text-transform:uppercase;">Secure Encrypted Document Management</p>
                            </td>
                        </tr>

                        <!-- Body Content -->
                        <tr>
                            <td style="padding: 36px 32px 24px 32px; background-color:#ffffff;">
                                <h2 style="color:#0F172A; font-size:20px; font-weight:700; margin:0 0 12px 0;">Verify Your Email Address</h2>
                                <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 24px 0;">
                                    Thank you for registering with <strong>DocVault</strong>. To complete your account registration and secure your vault access, please use the 6-digit verification code below:
                                </p>

                                <!-- OTP Code Box -->
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#FAF6EE; border:1px solid #EAE2D2; border-radius:20px; text-align:center; margin:0 0 28px 0;">
                                    <tr>
                                        <td style="padding:28px 20px;">
                                            <span style="font-size:11px; font-weight:700; color:#855A2B; text-transform:uppercase; letter-spacing:2px; display:block; margin-bottom:8px;">Your Security Code</span>
                                            <div style="font-size:42px; font-weight:800; color:#FF6B00; letter-spacing:10px; margin:8px 0; font-family:'Courier New', Courier, monospace;">${otpCode}</div>
                                            <span style="font-size:12px; color:#64748B; font-weight:500;">⏱️ Code expires in <strong>10 minutes</strong></span>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Security Notice Box -->
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F8FAFC; border-left:4px solid #FF6B00; border-radius:8px; margin:0 0 24px 0;">
                                    <tr>
                                        <td style="padding:14px 16px; color:#475569; font-size:13px; line-height:1.5;">
                                            <strong>Security Guidelines:</strong>
                                            <ul style="margin:6px 0 0 0; padding-left:18px; color:#64748B;">
                                                <li style="margin-bottom:4px;">Do not share this code with anyone.</li>
                                                <li style="margin-bottom:4px;">DocVault staff will never ask for your OTP code.</li>
                                                <li>If you didn't request this code, please ignore this email.</li>
                                            </ul>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#F8FAFC; padding:24px 32px; border-top:1px solid #E2E8F0; text-align:center;">
                                <p style="color:#64748B; font-size:12px; font-weight:600; margin:0 0 6px 0;">DocVault Security System</p>
                                <p style="color:#94A3B8; font-size:11px; margin:0 0 12px 0;">Automated message — Please do not reply directly to this email.</p>
                                <p style="color:#CBD5E1; font-size:11px; margin:0;">&copy; ${new Date().getFullYear()} DocVault Storage Inc. All rights reserved.</p>
                            </td>
                        </tr>

                    </table>
                    
                </td>
            </tr>
        </table>

    </body>
    </html>
    `;

    try {
        const transporter = createTransporter();
        if (transporter) {
            const info = await transporter.sendMail({
                from,
                to: toEmail,
                subject,
                text: `Your DocVault verification code is: ${otpCode}. Valid for 10 minutes.`,
                html: htmlTemplate
            });
            console.log(`[SMTP Email] Sent professional OTP email to ${toEmail}. MessageID: ${info.messageId}`);
            return { sent: true, method: 'smtp', messageId: info.messageId };
        } else {
            console.log(`[SMTP Warning] SMTP_USER/SMTP_PASS not set in server/.env. OTP code for ${toEmail} is: ${otpCode}`);
            return { sent: true, method: 'console_log' };
        }
    } catch (err) {
        console.error('[SMTP Email Error]', err);
        console.log(`[SMTP Fallback] OTP for ${toEmail} is: ${otpCode}`);
        return { sent: false, error: err.message };
    }
};

module.exports = {
    sendOtpEmail
};

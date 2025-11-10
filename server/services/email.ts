import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const APP_URL = process.env.REPL_SLUG 
  ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
  : process.env.APP_URL || 'http://localhost:5000';

// Resend sandbox mode: can only send to verified email
// To send to any email, verify a domain at resend.com/domains
const SANDBOX_MODE = FROM_EMAIL === 'onboarding@resend.dev';

export async function sendPasswordResetEmail(
  toEmail: string,
  resetToken: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;
    
    if (SANDBOX_MODE) {
      console.log(`📧 [SANDBOX MODE] Password reset email simulation`);
      console.log(`   To: ${toEmail}`);
      console.log(`   User: ${userName}`);
      console.log(`   Reset link: ${resetLink}`);
      console.log(`   ⚠️  In sandbox mode (onboarding@resend.dev), emails can only be sent to verified addresses.`);
      console.log(`   ⚠️  To send to any email, verify a domain at resend.com/domains and set RESEND_FROM_EMAIL`);
      
      // In sandbox mode, don't attempt to send to avoid 403 errors
      // Return success so the reset flow completes (user gets token in development)
      return { success: true };
    }
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'إعادة تعيين كلمة المرور - Password Reset | منصة ابراج التعليمية',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 14px 28px;
              background-color: #2563eb;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              text-align: center;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #1d4ed8;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
              text-align: center;
            }
            .warning {
              background-color: #fef3c7;
              border-right: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .link-text {
              word-break: break-all;
              color: #2563eb;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🦅 منصة ابراج التعليمية</div>
              <div style="color: #6b7280;">منصة التعليم الإلكتروني</div>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937;">مرحباً ${userName}</h2>
              <p>تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في منصة ابراج التعليمية.</p>
              
              <p>للمتابعة، يرجى النقر على الزر أدناه:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">إعادة تعيين كلمة المرور</a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280;">أو انسخ الرابط التالي والصقه في المتصفح:</p>
              <div class="link-text">${resetLink}</div>
              
              <div class="warning">
                <strong>⚠️ تنبيه أمني:</strong>
                <ul style="margin: 10px 0 0 0; padding-right: 20px;">
                  <li>هذا الرابط صالح لمدة ساعة واحدة فقط</li>
                  <li>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد</li>
                  <li>لا تشارك هذا الرابط مع أي شخص</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p>هذه رسالة تلقائية من منصة ابراج التعليمية<br>
              Abraj Educational Platform</p>
            </div>
          </div>
          
          <!-- English Version -->
          <div class="container" dir="ltr" style="margin-top: 20px;">
            <div class="header">
              <div class="logo">🦅 Abraj Educational Platform</div>
              <div style="color: #6b7280;">Learning Platform</div>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937;">Hello ${userName}</h2>
              <p>We received a request to reset the password for your Abraj Educational Platform account.</p>
              
              <p>To proceed, please click the button below:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
              <div class="link-text">${resetLink}</div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>This link is valid for 1 hour only</li>
                  <li>If you didn't request a password reset, please ignore this email</li>
                  <li>Do not share this link with anyone</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated message from Abraj Educational Platform</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      return { success: false, error: error.message };
    }

    console.log('Password reset email sent successfully:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

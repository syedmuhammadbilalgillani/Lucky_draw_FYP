// helpers/emailService.js
import nodemailer from 'nodemailer';
import logger from '../lib/logger.js';

// Email transporter configuration
// In production, use environment variables for SMTP settings
const createTransporter = () => {
  // For development, you can use a test account or configure SMTP
  // Example using Gmail (requires app-specific password):
  // return nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // });

  // For development/testing, use ethereal.email or similar
  // For production, configure with your SMTP provider
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Default: Use console logging for development (no actual email sent)
  return {
    sendMail: async (options) => {
      logger.info('Email would be sent:', {
        to: options.to,
        subject: options.subject,
        // Don't log full HTML body
      });
      // In development, just log the email
      console.log('\n=== EMAIL NOTIFICATION ===');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Body:', options.text || options.html?.substring(0, 200) + '...');
      console.log('========================\n');
      return { messageId: 'dev-' + Date.now() };
    },
  };
};

const transporter = createTransporter();

/**
 * Send winner notification email
 */
export async function sendWinnerEmail(user, draw, prize, ticketNumber) {
  try {
    const emailSubject = `🎉 Congratulations! You Won in ${draw.title}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .prize-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .ticket-number { background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 18px; font-weight: bold; margin: 10px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>You're a Winner!</p>
            </div>
            <div class="content">
              <p>Dear ${user.fullName},</p>
              
              <p>We're thrilled to inform you that you have won a prize in the <strong>${draw.title}</strong> draw!</p>
              
              <div class="prize-box">
                <h2 style="color: #667eea; margin-top: 0;">Your Prize</h2>
                <h3 style="font-size: 24px; margin: 10px 0;">${prize.prizeName}</h3>
                ${prize.prizeDescription ? `<p>${prize.prizeDescription}</p>` : ''}
                <p><strong>Rank:</strong> #${prize.prizeRank}</p>
              </div>
              
              ${ticketNumber ? `
                <p><strong>Your Ticket Number:</strong></p>
                <div class="ticket-number">${ticketNumber}</div>
              ` : ''}
              
              <p>Please contact us to claim your prize. We will verify your identity and arrange for prize collection.</p>
              
              <p style="margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/participant/draws/${draw.id}" class="button">View Draw Results</a>
              </p>
              
              <div class="footer">
                <p>Thank you for participating!</p>
                <p>Lucky Draw System</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Congratulations ${user.fullName}!

You have won a prize in the ${draw.title} draw!

Your Prize: ${prize.prizeName}
${prize.prizeDescription ? `Description: ${prize.prizeDescription}` : ''}
Rank: #${prize.prizeRank}
${ticketNumber ? `Ticket Number: ${ticketNumber}` : ''}

Please contact us to claim your prize.

View results: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/participant/draws/${draw.id}

Thank you for participating!
Lucky Draw System
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@luckydraw.com',
      to: user.email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Winner email sent to ${user.email}`, { messageId: info.messageId });
    return info;
  } catch (error) {
    logger.error('Failed to send winner email:', error);
    throw error;
  }
}

/**
 * Send notification to all participants about draw completion
 */
export async function sendDrawCompletionEmail(user, draw) {
  try {
    const emailSubject = `Draw Completed: ${draw.title}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Draw Completed</h1>
            </div>
            <div class="content">
              <p>Dear ${user.fullName},</p>
              
              <p>The draw <strong>${draw.title}</strong> has been completed and winners have been selected.</p>
              
              <p>Check out the results to see if you're a winner!</p>
              
              <p style="margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/participant/draws/${draw.id}" class="button">View Results</a>
              </p>
              
              <p style="margin-top: 30px; color: #666; font-size: 12px;">
                Thank you for participating!<br>
                Lucky Draw System
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@luckydraw.com',
      to: user.email,
      subject: emailSubject,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Completion email sent to ${user.email}`);
    return info;
  } catch (error) {
    logger.error('Failed to send completion email:', error);
    // Don't throw - this is optional
  }
}


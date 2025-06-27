
import nodemailer from 'nodemailer';
import config from '../../config.js';
import path from 'path';
import fs from 'fs';

const transport = nodemailer.createTransport(config.email.smtp);

// Verify SMTP connection
transport.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} html
 * @returns {Promise}
 */
export const sendEmail = async (to, subject, text, html = null) => {
  const msg = { 
    from: {
      name: config.email.fromName,
      address: config.email.from
    }, 
    to, 
    subject, 
    text,
    html: html || text 
  };
  
  try {
    const result = await transport.sendMail(msg);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Unable to send email: ${error.message}`);
  }
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @param {string} userName
 * @returns {Promise}
 */
export const sendResetPasswordEmail = async (to, token, userName = 'User') => {
  const resetUrl = `${config.app.frontendUrl}/reset-password?token=${token}`;
  
  const subject = 'Reset Your Password - Story Maker Admin';
  
  const textContent = `
Hello ${userName},

We received a request to reset your password for your Story Maker Admin account.

Please click the following link to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.

Best regards,
Story Maker Admin Team
  `.trim();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      color: #2c3e50;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #3498db;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .button:hover {
      background-color: #2980b9;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .warning {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .url-box {
      word-break: break-all; 
      background-color: #f8f9fa; 
      padding: 10px; 
      border-radius: 3px;
      border: 1px solid #dee2e6;
      font-family: monospace;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1> Password Reset Request</h1>
    </div>
    
    <p>Hello <strong>${userName}</strong>,</p>
    
    <p>We received a request to reset your password for your Story Maker Admin account.</p>
    
    <p>Click the button below to reset your password:</p>
    
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    
    <p>Or copy and paste this link into your browser:</p>
    <div class="url-box">
      ${resetUrl}
    </div>
    
    <div class="warning">
      <strong>⚠️ Security Notice:</strong>
      <ul>
        <li>This link will expire in <strong>1 hour</strong></li>
        <li>If you didn't request this password reset, please ignore this email</li>
        <li>Never share this link with anyone</li>
        <li>For security, this link can only be used once</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>This is an automated message, please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} Story Maker Admin. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    return await sendEmail(to, subject, textContent, htmlContent);
  } catch (error) {
    throw new Error(`Failed to send reset password email: ${error.message}`);
  }
};





export default {
  transport,
  sendEmail,
  sendResetPasswordEmail
};

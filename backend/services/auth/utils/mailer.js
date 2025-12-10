const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(toEmail, otp) {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: 'Verify your NSU email for Ryden',
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
             <h2>Welcome to Ryden!</h2>
             <p>Please use the following One-Time Password (OTP) to verify your email address:</p>
             <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
             <p>This code expires in 24 hours.</p>
             <p>If you didn't request this, please ignore this email.</p>
           </div>`,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Verification email sent:', info.messageId || info);
  return info;
}

module.exports = { sendVerificationEmail };

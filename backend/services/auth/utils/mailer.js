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

async function sendVerificationEmail(toEmail, token) {
  const appUrl = process.env.APP_URL || 'http://localhost:8081';
  const link = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: 'Verify your NSU email for Ryden',
    html: `<p>Please verify your email by clicking the link below:</p>
           <p><a href="${link}">${link}</a></p>
           <p>This link expires in ${process.env.EMAIL_VERIFICATION_EXPIRES || '24h'}.</p>`,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Verification email sent:', info.messageId || info);
  return info;
}

module.exports = { sendVerificationEmail };

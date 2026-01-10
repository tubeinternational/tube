// utils/sendEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  pool: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports.sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Admin Portal" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
};

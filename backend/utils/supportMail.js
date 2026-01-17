const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
});

exports.sendEmail = async ({
  to,
  subject,
  html,
  replyTo,
}) => {
  await transporter.sendMail({
    from: `"Tube Support" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
    replyTo,
  });
};

import nodemailer from 'nodemailer';
import catchAsync from './catchAsync.js';

const sendEmail = catchAsync(async (emailOptions) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const recipients = emailOptions.recipients;

  recipients.forEach(async (recipient) => {
    let info = await transporter.sendMail({
      from: 'K-LINK',
      to: recipient,
      subject: emailOptions.subject,
      text: emailOptions.message,
      html: emailOptions.html,
      attachments: emailOptions.attachments,
    });

    console.log('Message sent: %s', info.messageId);
  });

  return 'success';
});

export default sendEmail;

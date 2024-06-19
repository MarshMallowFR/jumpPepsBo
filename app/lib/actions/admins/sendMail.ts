import nodemailer from 'nodemailer';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

// Replace with your SMTP credentials
const smtpOptions = {
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'user',
    pass: process.env.SMTP_PASSWORD || 'password',
  },
};

const sendEmail = async (data: EmailPayload) => {
  const transporter = nodemailer.createTransport({
    ...smtpOptions,
  });

  return await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    ...data,
  });
};

export default async function handlerEmail(email: string, token: string) {
  await sendEmail({
    to: email,
    subject: 'Welcome to GrimpPeps BO',
    html: `http://localhost:3000/dashboard/admins/validate?token=${token}&email=${email}`,
  }).catch((error) => {
    throw new Error(`Error sending email: ${error}`);
  });
}

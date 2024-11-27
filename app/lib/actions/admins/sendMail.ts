import nodemailer from 'nodemailer';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

const smtpOptions = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'), //Port 587 recommandé pour STARTTLS plutôt que port 2525
  secure: false, //Avec un port non sécurisé (comme 2525 ou 587), secure doit être false. +  STARTTLS est utilisé, donc "secure" doit être à false
  auth: {
    user: process.env.SMTP_USER || 'user',
    pass: process.env.SMTP_PASSWORD || 'password',
  },
  // tls: {
  //   ciphers: 'SSLv3',
  //   rejectUnauthorized: false, // Désactive la vérification du certificat pour le développement
  // },
};

const sendEmail = async (data: EmailPayload) => {
  const transporter = nodemailer.createTransport(smtpOptions);

  return await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    ...data,
  });
};

export default async function handlerEmail(email: string, token: string) {
  const validationUrl = `http://jump-peps-bo.vercel.app/dashboard/admins/validate?token=${token}&email=${email}`;

  const messageContent = `
    <p>Bonjour,<p/>
    <p>Vous êtes invité(e) à rejoindre l'administration de l'association <strong>Grimp Pep's</strong>.<br/>
    Pour finaliser votre inscription, vous devez créer votre mot de passe en cliquant sur le lien suivant :<br>
    <a href="${validationUrl}">Je crée mon mot de passe</a>
    </p>
    <p>À bientôt,<br/>
    L'équipe Grimp Pep's</p>
  `;

  try {
    await sendEmail({
      to: email,
      subject: `Bienvenue sur le back-office de l'association Grimp Pep's`,
      html: messageContent,
    });
    return { isSuccess: true };
  } catch (error) {
    return {
      isSuccess: false,
    };
  }
}

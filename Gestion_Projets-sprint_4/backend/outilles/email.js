const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Créer un transporteur
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Options d'email
  const mailOptions = {
    from: "E-project Team <" + process.env.EMAIL_USERNAME + ">",
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // Envoyer l'email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

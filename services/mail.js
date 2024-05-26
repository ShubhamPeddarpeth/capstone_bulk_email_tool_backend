const sgMail = require("@sendgrid/mail");
require("dotenv").config();


const sendMail = (fromEmail, toEmail, subject, message) => {
  sgMail.setApiKey(process.env.Secret_Mail_Apikey);
  const msg = {
    to: toEmail,
    from: fromEmail,
    subject: subject,
    text: message,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error("error", error);
    });
};

module.exports = { sendMail };

import "../../environment.js";
import sgMail from "@sendgrid/mail"

const API_key = process.env.sendGrid_API_key

// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs


sgMail.setApiKey(API_key)

function sendEmail(email, subject, message){
    const msg = {
        to: email, // Change to your recipient
        from: process.env.sendGrid_from_email, // Change to your verified sender
        subject: subject,
        html: message,
      }
      sgMail
        .send(msg)
        .catch((error) => {
          console.error(error)
        })
}


export default sendEmail
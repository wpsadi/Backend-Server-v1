import nodemailer from "nodemailer";
import "../../environment.js"

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async function (email, subject, message) {
  // throw new Error("Unable to process your request")
  // create reusable transporter object using the default SMTP transport
  try{
    let transporter = nodemailer.createTransport({
      host: process.env.Brevo_SMTP_HOST,
      port: process.env.Brevo_SMTP_PORT,
      secure:false, // true for 465, false for other ports
      auth: {
        user: process.env.Brevo_SMTP_USERNAME,
        pass: process.env.Brevo_SMTP_PASSWORD,
      },
    });
  
    // send mail with defined transport object
    await transporter.sendMail({
      from: process.env.Brevo_SMTP_FROM_EMAIL, // sender address
      to: email, // user email
      subject: subject, // Subject line
      html: message, // html body
    });
  }
  catch(e){
    throw new Error("Some Error Occurred. This means that problem is in our mailing system")
  }
  

};




export default sendEmail;
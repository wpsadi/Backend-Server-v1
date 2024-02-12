import AdminSessionModel from "../SCHEMA/AdminLoginSessions.js"
import { Admin } from "../SCHEMA/adminSchema.js"
import { temp2 } from "../UTILITY/EmailTemplates.js"
import AppError from "../UTILITY/errClass.js"
import "../environment.js"
import sendEmail from "../UTILITY/finalMailService.js"

// console.log(process.env.authorizeURL)

export const CheckAdmin = async(req,res,next)=>{
    
    const {sessionID} = req.admin
    // console.log(req.admin)
    const AdminExist = await AdminSessionModel.findById(sessionID)

    if (!AdminExist){
        return next(new AppError("You are not authorized to go further"))
    }

    req.adminDetails = await Admin.findById(AdminExist["adminID"]);



    if (AdminExist.Revoked){
        return next(new AppError("Your have refused the authorization email sent to your Email"))
    }

    if (!req.adminDetails){
        return next(new AppError("The token has Invalid values"))
    }

    // console.log(AdminExist["adminID"])

    if (AdminExist.Approved == false && AdminExist.Revoked == false){
        const Authorizelink = `${process.env.authorizeURL}${sessionID}`;
        const Revokelink = `${process.env.rejectURL}${sessionID}`
        const mail = temp2(req.adminDetails.AdminName,Authorizelink,Revokelink)
         

        if (AdminExist.verificationMailSentCount > process.env.max_authorization_email_count_admin){
            return next(new AppError(`Already too many times Authorization mail is sent to you `))
        }
        else{
            AdminExist.verificationMailSentCount++;
            await AdminExist.save()
            sendEmail(req.adminDetails.AdminEmail,mail[0],mail[1])
            return next(new AppError("Please click the link that we sent you to verify your identity"))
        }

    }



    // console.log(sessionID)
    req.admin = {adminID:AdminExist["adminID"]}

    // console.log(AdminExist["adminID"])

    
    

    next();

}
import { Admin } from "../../SCHEMA/adminSchema.js";
import { emailVal } from "../../UTILITY/emailVal.js";
import AppError from "../../UTILITY/errClass.js";
import "../../environment.js"

import sendEmail from "../../UTILITY/SendEmails.js/brevoMail.js";

export const pong = async (req, res) => {
    let response = `pong -[${req.method}]`;

    res.status(200).json({
        status: true,
        res_type: typeof response,
        response: response
    })
}

export const sendConfirmationOfAdmin = async (req, res, next) => {
    let response = req.admin
    res.status(200).json({
        status: true,
        res_type: typeof response,
        response: response
    })
}

export const createNewAdmin = async (req, res, next) => {//New Admin can only be create using an already created admin account
    try {

        const { AdminName, AdminEmail, password } = req.body;
        const VerifiedBy = req.admin.adminID;
        // const VerifiedBy = "prime"; //-> for Prime account

        if (!AdminEmail || !AdminName || !password) {
            return next(new AppError("Fields required to create New Admin are empty", 400))
        }
        if (!VerifiedBy) {
            return next(new AppError("No referer Admin ID found. An admin can only request to create a new Account", 400))
        }

        const validatedEmail = await emailVal(AdminEmail)

        if (!validatedEmail) {
            return next(new AppError("Email is syntactically incorrect", 400))
        }


        const NewAdmin = await Admin.create({
            AdminName, password, AdminEmail, VerifiedBy
        })

        let link = (()=>{
            return `${process.env.verificationURL}${NewAdmin._id}`
        })()

        // sendEmail(AdminEmail,"") // SEND THE MAIL HERE
        sendEmail(AdminEmail,`[To Verify]: SignUp`,`Hi ${AdminName}, You are given Admin Access to ${process.env.AboutTheProject}. To confirm this <br><br> Click the below Link <br><br><br> <a href="${link}">${link}</a><br><br><br>If not completed within 1-2 weeks the account will be Terminated and you will have to create again`)

        let response = "We have sent a Verfication link on the email provided. Please complete the process to initiate the account. If not completed within 1-2 weeks the account will be Terminated and you will have to login again"
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

export const Admin_Login = async (req, res, next) => {
    try {

        const { AdminEmail, password } = req.body;

        if (!AdminEmail || !password) {
            return next(new AppError("Login Fields for Admin are Empty", 400))
        }

        const validatedEmail = await emailVal(AdminEmail)

        if (!validatedEmail) {
            return next(new AppError("Email is syntactically incorrect", 400))
        }

        const verifyAdminCredentials = await Admin.findOne({ AdminEmail }).select("+password")

        if (!verifyAdminCredentials) {
            return next(new AppError("Email doesn't exist in Admin Database", 400))
        }

        // console.log(await verifyAdminCredentials.comparePass(password))

        if (!(await verifyAdminCredentials.comparePass(password))) {
            return next(new AppError("Incorrect Password", 400))
        }
        

        if (!await verifyAdminCredentials.EmailVerified){
            // SEND THE MAIL 
            let link = (()=>{
                return `${process.env.verificationURL}${verifyAdminCredentials._id}`
            })()
    
            // sendEmail(AdminEmail,"") // SEND THE MAIL HERE
            sendEmail(AdminEmail,`[To Verify]: SignUp`,`Hi again ${verifyAdminCredentials.AdminName},You have just tried to login, but you haven't completed the process... so here we are again <br><br> You are given Admin Access to ${process.env.AboutTheProject}. To confirm this <br><br> Click the below Link <br><br><br> <a href="${link}">${link}</a><br><br><br>If not completed within 1-2 weeks the account will be Terminated and you will have to create again`)
            return next(new AppError("We have sent a Verification mail to your mail. We previously also sent an Account Confirmation on your email, please verify your account and then login here", 400))
        }


        let CookieOptions = {
            httpOnly: true,
            // sameSite:none,
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000    // 7 Days
        }

        // console.log(verifyAdminCredentials)

        const AdminToken = verifyAdminCredentials.genJWT()


        res.cookie("AdminToken", AdminToken, CookieOptions)

        let response = await verifyAdminCredentials.details()
        delete response["password"];
        // console.log(response)
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        // console.log("hi")
        return next(new AppError(e.message, 400))
    }



}

export const createPrimeAdmin = async (req, res, next) => {//New Admin can only be create using an already created admin account
    try {

        const { AdminName, AdminEmail, password } = req.body;
        // const VerifiedBy = req.admin.adminID;
        const VerifiedBy = "prime"; //-> for Prime account

        if (!AdminEmail || !AdminName || !password) {
            return next(new AppError("Fields required to create Prime Admin are empty", 400))
        }
        if (!VerifiedBy) {
            return next(new AppError("No referer Admin ID found. An admin can only request to create a Account", 400))
        }

        const validatedEmail = await emailVal(AdminEmail)

        if (!validatedEmail) {
            return next(new AppError("Email is syntactically incorrect", 400))
        }

        if (await Admin.countDocuments({VerifiedBy}>0)) {
            return next(new AppError("Prime is already been declared once."))
        }

        const NewAdmin = await Admin.create({
            AdminName, password, AdminEmail, VerifiedBy
        })

        // SEND THE MAIL
        let link = (()=>{
            return `${process.env.verificationURL}${NewAdmin._id}`
        })()

        // sendEmail(AdminEmail,"") // SEND THE MAIL HERE
        sendEmail(AdminEmail,`[To Verify]: SignUp`,`Hi ${AdminName}, You are given Admin Access to ${process.env.AboutTheProject}. To confirm this <br><br> Click the below Link <br><br><br> <a href="${link}">${link}</a><br><br><br>If not completed within 1-2 weeks the account will be Terminated and you will have to create again`)
        let response = "We have sent a Verfication link on the email provided. Please complete the process to initiate the account"
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

export const SearchAdminFromID = async(req,res,next)=>{
    try{
        const {passedID} = req.params;

        const getDetailsOfAdmin = await Admin.findById(passedID);
        
        if (!getDetailsOfAdmin){
            return next(new AppError("Invalid ID"))
        }
    
        let response = {AdminName:getDetailsOfAdmin.AdminName,AdminEmail:getDetailsOfAdmin.AdminEmail};
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    }catch(e){
        return next(new AppError(e.message))
    }
    

}

export const verifyAdminAccount = async(req,res,next)=>{
    try{
        const {passedID} = req.params;

        const adminExists = await Admin.findByIdAndUpdate(passedID,{
            $set:{EmailVerified:true}
        });

        if (!adminExists){
            return next(new AppError("Admin account doesn't exist"))
        }

        if (adminExists.AdminEmail){
            return next(new AppError("Invalid Route"))
        }

        let response = "Account Validated"
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    }
    catch(e){
        return next(new AppError(e.message))
    }
}

export const DismissAdmin = async(req,res,next)=>{
    try{

        const {adminID} = req.params;

        const adminExists = await Admin.findById(adminID)

        if(!adminExists){
            return next(new AppError("Invalid Admin ID"))
        }

        if (adminExists.VerifiedBy == "prime"){
            return next(new AppError("You can't terminate PRIME Admin"))
        }
        // console.log(req.adminDetails)adminExists.AdminEmail
        
        await Admin.findByIdAndDelete(adminID)
        sendEmail(adminExists.AdminEmail,`[To Inform]: You are dismissed`,`Hi ${adminExists.AdminName}, we have sent you this email to inform you that:<br> You no longer will have access to Admin panel of ${process.env.AboutTheProject}. Your Credentials will no longer be valid on the login portal. <br><br> You were Dismissed by <b>${req.adminDetails.AdminName}</b> `)

        let response = "Admin DISMISSED";
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    }
    catch(e){
        console.log("hi")
        return next(new AppError(e.message))
    }
}
import { Admin } from "../../SCHEMA/adminSchema.js";
import { emailVal } from "../../UTILITY/emailVal.js";
import AppError from "../../UTILITY/errClass.js";
import "../../environment.js"

import sendEmail from "../../UTILITY/finalMailService.js";
import UpdateModelAdmin from "../../SCHEMA/updatesInAdmin.js"
import updatesInAdmin from "../../SCHEMA/updatesInAdmin.js";

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

        let link = (() => {
            return `${process.env.verificationURL}${NewAdmin._id}`
        })()

        // sendEmail(AdminEmail,"") // SEND THE MAIL HERE
        sendEmail(AdminEmail, `[To Verify]: SignUp`, `Hi ${AdminName}, You are given Admin Access to ${process.env.AboutTheProject}. To confirm this <br><br> Click the below Link <br><br><br> <a href="${link}">${link}</a><br><br><br>If not completed within 1-2 weeks the account will be Terminated and you will have to create again`)

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


        if (!await verifyAdminCredentials.EmailVerified) {
            // SEND THE MAIL 
            let link = (() => {
                return `${process.env.verificationURL}${verifyAdminCredentials._id}`
            })()

            // sendEmail(AdminEmail,"") // SEND THE MAIL HERE
            sendEmail(AdminEmail, `[To Verify]: SignUp`, `Hi again ${verifyAdminCredentials.AdminName},You have just tried to login, but you haven't completed the process... so here we are again <br><br> You are given Admin Access to ${process.env.AboutTheProject}. To confirm this <br><br> Click the below Link <br><br><br> <a href="${link}">${link}</a><br><br><br>If not completed within 1-2 weeks the account will be Terminated and you will have to create again`)
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

        if (await Admin.countDocuments({ VerifiedBy } > 0)) {
            return next(new AppError("Prime is already been declared once."))
        }

        const NewAdmin = await Admin.create({
            AdminName, password, AdminEmail, VerifiedBy
        })

        // SEND THE MAIL
        let link = (() => {
            return `${process.env.verificationURL}${NewAdmin._id}`
        })()

        // sendEmail(AdminEmail,"") // SEND THE MAIL HERE
        sendEmail(AdminEmail, `[To Verify]: SignUp`, `Hi ${AdminName}, You are given Admin Access to ${process.env.AboutTheProject}. To confirm this <br><br> Click the below Link <br><br><br> <a href="${link}">${link}</a><br><br><br>If not completed within 1-2 weeks the account will be Terminated and you will have to create again`)
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

export const SearchAdminFromID = async (req, res, next) => {
    try {
        const { passedID } = req.params;

        const getDetailsOfAdmin = await Admin.findById(passedID);

        if (!getDetailsOfAdmin) {
            return next(new AppError("Invalid ID"))
        }

        let response = { AdminName: getDetailsOfAdmin.AdminName, AdminEmail: getDetailsOfAdmin.AdminEmail };
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message))
    }


}

export const verifyAdminAccount = async (req, res, next) => {
    try {
        const { passedID } = req.params;

        const adminExists = await Admin.findByIdAndUpdate(passedID, {
            $set: { EmailVerified: true }
        });

        if (!adminExists) {
            return next(new AppError("Admin account doesn't exist"))
        }

        if (adminExists.EmailVerified) {
            return next(new AppError("Invalid Route"))
        }

        let response = "Account Validated"
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    }
    catch (e) {
        return next(new AppError(e.message))
    }
}

export const DismissAdmin = async (req, res, next) => {
    try {

        const { adminID } = req.params;

        const adminExists = await Admin.findById(adminID)

        if (!adminExists) {
            return next(new AppError("Invalid Admin ID"))
        }

        if (adminExists.VerifiedBy == "prime") {
            return next(new AppError("You can't terminate PRIME Admin"))
        }
        // console.log(req.adminDetails)adminExists.AdminEmail

        await Admin.findByIdAndDelete(adminID)
        sendEmail(adminExists.AdminEmail, `[To Inform]: You are dismissed`, `Hi ${adminExists.AdminName}, we have sent you this email to inform you that:<br> You no longer will have access to Admin panel of ${process.env.AboutTheProject}. Your Credentials will no longer be valid on the login portal. <br><br> You were Dismissed by <b>${req.adminDetails.AdminName}</b> `)

        let response = "Admin DISMISSED";
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    }
    catch (e) {
        // console.log("hi")
        return next(new AppError(e.message))
    }
}

export const UpdateAdmin = async (req, res, next) => {
    try {
        const { adminID } = req.admin

        const AdminDetails = await Admin.findById(adminID).select("-EmailVerified -VerifiedBy");

        if (!AdminDetails) {
            return next(new AppError("AdminID not found somehow. [This was not supposed to happen]"))
        }

        const { AdminName, AdminEmail, password } = req.body

        const updatesVar = ["AdminName", "AdminEmail", "password"];

        const updates = [AdminName, AdminEmail, password]

        let checkEmailUpdate = false
        let checkPasswordUpdate = false

        let body = {}

        for (let x in updates) {
            if (updates[x]) {

                if ((updatesVar[x] == updatesVar[1])) {
                    const validatedEmail = await emailVal(AdminEmail)

                    if (!validatedEmail) {
                        return next(new AppError("Email is syntactically incorrect", 400))
                    }


                    body[updatesVar[x]] = updates[x]


                    checkEmailUpdate = true


                    continue
                }
                if (updatesVar[x] == updatesVar[2]) {
                    checkPasswordUpdate = true
                }
                body[updatesVar[x]] = updates[x]
            }
        }

        const UpdateIn = adminID
        // console.log(UpdateIn)

        let requestChnge

        if (await UpdateModelAdmin.countDocuments({ UpdateIn }) > 0) {
            requestChnge = await UpdateModelAdmin.findOne({ UpdateIn })
            for (let i in body) {
                requestChnge[i] = body[i]
            }
            requestChnge["UpdateIn"] = UpdateIn
        }
        else {
            requestChnge = await UpdateModelAdmin.create(body)
            for (let i in body) {
                requestChnge[i] = body[i]
            }
            requestChnge["UpdateIn"] = UpdateIn
        }
        requestChnge["expiresAt"] = new Date(Date.now() + (30 * 60 * 1000))
        await requestChnge.save();

        let response;
        // console.log(AdminDetails)

        if (checkEmailUpdate) {
            // sendEmail(AdminEmail,"") // SEND THE MAIL HERE
            let link = (() => {
                return `${process.env.verificationURL}changes/${requestChnge._id}`
            })()
            sendEmail(body["AdminEmail"], `[To Verify change]: Change in Credentials`, `Hi ${body["AdminName"] || AdminDetails.AdminName},You requested a change in Email address so to verify the new Email and to give you the Admin Access to ${process.env.AboutTheProject}. To confirm this <br><br> Click the below Link <br><br><br> <a href="${link}">${link}</a><br><br><br>If not completed within 30min the changes will be Terminated and you will have to create again. <u>If you don't know about ${process.env.AboutTheProject} then ignore this Email</u><br><br><b>In case you know: If you did not requested these changes then contact the admin ASAP </b>`)
            response = "We have sent an email to verify your new Email. Admin Credentials UPDATED successfully. You are now Logged OUT";
        }
        else {
            let link = (() => {
                return `${process.env.verificationURL}${requestChnge._id}`
            })()
            // console.log(AdminDetails)
            sendEmail(AdminDetails.AdminEmail, `[To Verify change]: Change in Credentials`, `Hi ${body["AdminEmail"] || AdminDetails.AdminName},You requested a change in Login Credentials for Admin access of ${process.env.AboutTheProject} so to verify if you really requested it . To confirm this <br><br> Click the below Link <br><br><br> <a href="${link}">${link}</a><br><br><br>If not completed within 30min weeks the changes will be Terminated and you will have to create again. <b>If you did not requested these changes and </b>`)

            response = "We have SENT you a verification Email. We have Admin Credentials UPDATED successfully. You are now Logged OUT";
        }


        res.cookie("AdminToken", "")

        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })



    }
    catch (e) {
        return next(new AppError(e.message))
    }
}

export const forgeAdminChnges = async (req, res, next) => {
    try {
        const { ChngeID } = req.params;
        const updates = await UpdateModelAdmin.findByIdAndDelete(ChngeID).select("-_id -expiresAt -createdAt -__v")

        if (!updates){
            return next(new AppError("Invalid Route"))
        }

        let keys = Object.keys(updates)
        let arr = new Array();



        for (let x of keys){
            if (x !="UpdateIn"){
                continue
            }
        }

        let body = {};

        for (let x in arr){
             body[x] = arr[x]
        }

        console.log(updates.UpdateIn,body)

        await UpdateModelAdmin.findByIdAndUpdate(updates.UpdateIn,{
            $set:body
        },{runValidators:true})

        let response = "Changes Validated"
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })



    } catch (e) {
        return next(new AppError(e.message))
    }


}

import { Admin } from "../../SCHEMA/adminSchema.js";
import { emailVal } from "../../UTILITY/emailVal.js";
import AppError from "../../UTILITY/errClass.js";
import "../../environment.js"

import {sendEmail} from "../../UTILITY/finalMailService.js";
import UpdateModelAdmin from "../../SCHEMA/updatesInAdmin.js"
import { temp1, temp2 } from "../../UTILITY/EmailTemplates.js";
import AdminSessionModel from "../../SCHEMA/AdminLoginSessions.js";
import adminIPLog from "../../SCHEMA/IpLogsAdminLoginPreventAbuse.js";


export const pong = async (req, res) => {
    let response = `pong -[${req.method}]`;

    res.status(200).json({
        status: true,
        res_type: typeof response,
        response: response
    })
}

export const getAllAdmins = async(req,res,next)=>{
    // console.log("hi")
    try{

        let AllAdmins = await Admin.find().select("-__v")
    
        AllAdmins = new Object(AllAdmins) // this will create a new instance of the object so that no changes can be made by mistake
    
        let AllIDs = AllAdmins.map((obj)=>obj.id)
    
        const {adminID} = req.admin
    
        let indexOfCurrentAccount = AllIDs.indexOf(adminID) //this will always be true since UserAdmin Checks are there in this route too
    
        // console.log(indexOfCurrentAccount,AllIDs,adminID)
        if (indexOfCurrentAccount != 0){
            let temp = AllAdmins[indexOfCurrentAccount]
            AllAdmins[indexOfCurrentAccount] = AllAdmins[0]
            AllAdmins[0] = temp
        }

    
        let response = AllAdmins
        res.status(200).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    }catch(e){
        return next(new AppError(e.message))
    }
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
        await sendEmail(AdminEmail, `[To Verify]: SignUp`, `Hi ${AdminName}, You are given Admin Access to ${process.env.AboutTheProject}. To confirm this <br><br> Click the below Link <br><br><br> <a href="${link}">${link}</a><br><br><br>If not completed within 1-2 weeks the account will be Terminated and you will have to create again`)

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

        let IPLog = await adminIPLog.findOne({ ip: req.clientIp})
        if (!IPLog){
            // IPexpiresAt = new Date(Date.now() + (3* 60 * 60 * 1000))// IP log expires after 3 hourse
            // ,expiresAt:IPexpiresAt
            IPLog = await adminIPLog.create({ ip: req.clientIp, adminLoginRequests:[{EmailID:AdminEmail}]})
            IPLog["expiresAt"] = new Date(Date.now() + (3 * 60 * 60 * 1000))
            await IPLog.save();
            
        }        

        let AllMailsTried = (IPLog.adminLoginRequests).map((obj)=>obj.EmailID)
        let index = AllMailsTried.indexOf(AdminEmail);

        if (index == -1){
            IPLog.adminLoginRequests = [...IPLog.adminLoginRequests,{EmailID:AdminEmail}]

        }

        // AllMailsTried = (IPLog.adminLoginRequests).map((obj)=>obj.EmailID)
        // index = AllMailsTried.indexOf(AdminEmail);

        

        if (!IPLog) {
            return next("unable to log your IP. So we can't process your request at the moment")
        }


        if (!await verifyAdminCredentials.EmailVerified && AllMailsTried.include(AdminEmail)) {
            // SEND THE MAIL 

            if (IPLog.adminLoginRequests[index].EmailVerify >= process.env.maxVerifyEmailMail){

                return next(new AppError("We have sent enough number of Email Verification to Your Mail Address for now. Limit Reached. Try after a cooling period of 3 hrs"))
            }

            let link = (() => {
                return `${process.env.verificationURL}${verifyAdminCredentials._id}`
            })()

            // sendEmail(AdminEmail,"") // SEND THE MAIL HERE
            await sendEmail(AdminEmail, `[To Verify]: SignUp`, `Hi again ${verifyAdminCredentials.AdminName},You have just tried to login, but you haven't completed the process... so here we are again <br><br> You are given Admin Access to ${process.env.AboutTheProject}. To confirm this <br><br> Click the below Link <br><br><br> <a href="${link}">${link}</a><br><br><br>If not completed within 1-2 weeks the account will be Terminated and you will have to create again`)
            IPLog.adminLoginRequests[index].EmailVerify++;
            IPLog.save();
            return next(new AppError("We have sent a Verification mail to your mail. We previously also sent an Account Confirmation on your email, please verify your account and then login here", 400))
        }








        let CookieOptions = {
            httpOnly: true,
            // sameSite:none,
            secure: true,
            maxAge: 12 * 60 * 60 * 1000    // 12 hours
        }

        // console.log(verifyAdminCredentials)
        const sessionExpire = new Date(Date.now() + (12* 60 * 60 * 1000))


        const createSession = await AdminSessionModel.create({ adminID: verifyAdminCredentials._id})
        
        createSession["expiresAt"] = new Date(Date.now() + (12 * 60 * 60 * 1000))
        await createSession.save();

        // console.log(createSession,createSession._id)
        // console.log(createSession["_id"])
        if (IPLog.adminLoginRequests[index].LoginAuthMail >= process.env.maxLoginAuthMail){
            await AdminSessionModel.findByIdAndDelete(createSession.id)
            return next(new AppError("We have sent enough number of Authorization emails to Your Mail Address for now. Limit Reached. Try after a cooling period of 3 hrs"))
        }

        const Authorizelink = `${process.env.authorizeURL}${createSession.id}`;
        const Revokelink = `${process.env.rejectURL}${createSession.id}`
        const mail = temp2(verifyAdminCredentials.AdminName, Authorizelink, Revokelink)
        await sendEmail(AdminEmail, mail[0], mail[1])

        // console.log(IPLog)
        // console.log(IPLog.adminLoginRequests[index])
        IPLog.adminLoginRequests[index].LoginAuthMail++;
        IPLog.save();

        const AdminToken = await createSession.genJWT()


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

export const Admin_Logout = async(req,res,next)=>{
    try{
        res.cookie("AdminToken","")
        let response = "Successfully Logged Out"
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    }catch(e){
        return next(new AppError(e.message))
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
        const email = temp1(AdminName, link)
        await sendEmail(AdminEmail, email[0], email[1])
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
        await sendEmail(adminExists.AdminEmail, `[To Inform]: You are dismissed`, `Hi ${adminExists.AdminName}, we have sent you this email to inform you that:<br> You no longer will have access to Admin panel of ${process.env.AboutTheProject}. Your Credentials will no longer be valid on the login portal. <br><br> You were Dismissed by <b>${req.adminDetails.AdminName}</b> `)

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

        // console.log(adminID)

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
            await sendEmail(body["AdminEmail"], `[To Verify change]: Change in Credentials`, `Hi ${body["AdminName"] || AdminDetails.AdminName},You requested a change in Email address so to verify the new Email and to give you the Admin Access to ${process.env.AboutTheProject}. To confirm this <br><br> Click the below Link <br><br><br> <a href="${link}">${link}</a><br><br><br>If not completed within 30min the changes will be Terminated and you will have to create again. <u>If you don't know about ${process.env.AboutTheProject} then ignore this Email</u><br><br><b>In case you know: If you did not requested these changes then contact the admin ASAP </b>`)
            response = "We have sent an email to verify your new Email. Admin Credentials UPDATED successfully. You are now Logged OUT";
        }
        else {
            let link = (() => {
                return `${process.env.verificationURL}${requestChnge._id}`
            })()
            // console.log(AdminDetails)
            await sendEmail(AdminDetails.AdminEmail, `[To Verify change]: Change in Credentials`, `Hi ${body["AdminEmail"] || AdminDetails.AdminName},You requested a change in Login Credentials for Admin access of ${process.env.AboutTheProject} so to verify if you really requested it . To confirm this <br><br> Click the below Link <br><br><br> <a href="${link}">${link}</a><br><br><br>If not completed within 30min weeks the changes will be Terminated and you will have to create again. <b>If you did not requested these changes and </b>`)

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

        if (!updates) {
            return next(new AppError("Invalid Route"))
        }

        // console.log(updates)

        // console.log(UpdateModelAdmin.schema)
        let keys = Object.keys(updates._doc)

        let arr = new Array();

        // console.log(keys)



        for (let x of keys) {
            if (x == "UpdateIn") {
                continue
            }
            arr.push(x)
        }

        // console.log(keys, arr)

        let body = {};

        for (let x of arr) {
            body[x] = updates[x]
        }

        // console.log(updates.UpdateIn, body)

        await Admin.findByIdAndUpdate(updates.UpdateIn, {
            $set: body
        }, { runValidators: true })

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

export const AllowAdminSession = async (req, res, next) => {
    try {
        const { passedSessionID } = req.params;

        const session = await AdminSessionModel.findById(passedSessionID);

        if (!session) {
            return next(new AppError("Invalid Route"))
        }

        if (session.Approved == true) {
            return next(new AppError("Invalid Route"))
        }

        if (session.Revoked != session.Approved) {
            return next(new AppError("Session is Already Rejected Once"))
        }

        session.Approved = true

        await session.save();

        let response = "Session Successfully Authorised"
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

export const RevokeAdminSession = async (req, res, next) => {
    try {
        const { passedSessionID } = req.params;

        const session = await AdminSessionModel.findById(passedSessionID);

        if (!session) {
            return next(new AppError("Invalid Route"))
        }

        if (session.Revoked == true) {
            return next(new AppError("Invalid Route"))
        }

        if (session.Revoked != session.Approved) {
            return next(new AppError("Session is Already Approved Once"))
        }

        session.Revoked = true

        await session.save();

        let response = "Session Successfully Revoked"
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

export const RevokeFromAdminPanel = async(req,res,next) =>{
    try{
        const {sessionID} = req.params
        const sessionExist = await AdminSessionModel.findById(sessionID)
    
        if (!sessionExist){
            return next(new AppError("No SessionID Found"))
        }
    
        sessionExist.Revoked = true;
        sessionExist.Approved = true;
    
        await sessionExist.save()
    
        let response = "Access Revoked";
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

export const GetAdminSessions = async(req,res,next)=>{
    try{
        
        const sessionExist = await AdminSessionModel.find({adminID:req.admin.adminID,Revoked:false,Approved:true})
    
        if (sessionExist.length == 0){
            return next(new AppError("No SessionID Found"))
        }

        const copySessions = new Object(sessionExist)

        const AllSessionIDs = sessionExist.map((obj)=>obj.id)
        // console.log(AllSessionIDs,req.SessionID)

        let index = AllSessionIDs.indexOf(req.SessionID);
        // console.log(index)

        if (index != 0){
            let temp = copySessions[0];
            copySessions[0] = copySessions[index]
            copySessions[index] = temp
        }

        let response = copySessions;

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

export const RevokeAllExceptCurrentAdminPanel = async (req,res,next)=>{
    try{
        
        const sessionExist = await AdminSessionModel.find({adminID:req.admin.adminID,Revoked:false})
    
        if (sessionExist.length == 0){
            return next(new AppError("No SessionID Found"))
        }

        const AllSessionIDs = sessionExist.map((obj)=>obj.id)
        // console.log(AllSessionIDs,req.SessionID)

        let index = AllSessionIDs.indexOf(req.SessionID);
        // console.log(index)

        if (index != 0){
            let temp = AllSessionIDs[0];
            AllSessionIDs[0] = AllSessionIDs[index]
            AllSessionIDs[index] = temp
        }

        if (AllSessionIDs.length == 1){
            return next(new AppError("There are no Parallel Sessions for this Account"))
        }
        let RestAllSessionIDs = AllSessionIDs.slice(1,AllSessionIDs.length)
        

        for(let id of RestAllSessionIDs){
            await AdminSessionModel.findByIdAndUpdate(id,{
                $set:{Approved:true,Revoked:true}
            })
        }


        
        let response = "All session have been Revoked";
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
import { Admin } from "../../SCHEMA/adminSchema.js";
import { emailVal } from "../../UTILITY/emailVal.js";
import AppError from "../../UTILITY/errClass.js";
import "../../environment.js"

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

        let response = "New Admin account created"
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

        console.log(await verifyAdminCredentials.comparePass(password))

        if (!(await verifyAdminCredentials.comparePass(password))) {
            return next(new AppError("Incorrect Password", 400))
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
        console.log(response)
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
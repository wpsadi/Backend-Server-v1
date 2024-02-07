import { Admin } from "../SCHEMA/adminSchema.js";
import { emailVal } from "../UTILITY/emailVal.js";
import AppError from "../UTILITY/errClass.js";
import { Blog } from "../SCHEMA/blogSchema.js";
import { saveImageOnGit } from "../UTILITY/SaveImageOnGit.js"
import { RawURL } from "../UTILITY/rawGitFormat.js";
import path from "path"

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

        if (!verifyAdminCredentials.comparePass(password)) {
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

        let response = verifyAdminCredentials
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

//Blogs-AdminRoutes

export const CreateBlog = async (req, res, next) => {
    try {

        const { BlogTitle, BlogAuthor, BlogAuthorEmail, BlogContent, BlogCategory } = req.body
        // console.log(req.body,!BlogContent)
        if (!BlogContent) {
            return next(new AppError("Content not found or Empty. While we except the submission of empty details in Other Fields, we highly encourage You to submit a complete form"))
        }


        const BlogImage = {}
        const createBlog = await Blog.create({ BlogTitle, BlogAuthor, BlogAuthorEmail, BlogContent, BlogCategory, BlogImage });

        if (req.file) {
            console.log(req.file.path)
            console.log(path.resolve(req.file.path))
            try {
                await saveImageOnGit(req.file.path)
                // console.log(rawGitUpload)
                createBlog.BlogImage.rawgit_url = RawURL(req.file.path)
                // console.log(createBlog)

            }
            catch (e) {
                return next(new AppError(e.message))
                // console.log(e.message)
                
            }

        }

        await createBlog.save() 




        // let response = createBlog
        let response = await Blog.findById(createBlog._id)
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }



}



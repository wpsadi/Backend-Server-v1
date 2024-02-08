// this file contains all the routes of Blogs

import { emailVal } from "../../UTILITY/emailVal.js";
import AppError from "../../UTILITY/errClass.js";
import "../../environment.js"
import { Blog } from "../../SCHEMA/blogSchema.js";
import fs from "fs/promises"
import cloudinary from "cloudinary"

//Blogs-AdminRoutes

export const CreateBlog = async (req, res, next) => {
    try {

        const { BlogTitle, BlogAuthor, BlogAuthorEmail, BlogContent } = req.body

        let BlogCategory = req.body.BlogCategory;
        if (!!BlogCategory) {
            BlogCategory = (function () {
                BlogCategory = BlogCategory.split(";");
                let CategoryArr = new Array();
                for (let category of BlogCategory){
                    let trimmed = category.trim();
                    
                    if (trimmed.length>0){
                        CategoryArr.push(trimmed)
                    }
                }

                return CategoryArr
            })()
        }

        // console.log(req.body,!BlogContent)
        if (!BlogContent) {
            return next(new AppError("Content not found or Empty. While we except the submission of empty details in Other Fields, we highly encourage You to submit a complete form"))
        }

        // console.log(BlogAuthorEmail,await emailVal(BlogAuthorEmail),BlogAuthorEmail && (await emailVal(BlogAuthorEmail)))
        // console.log(BlogAuthorEmail && !(await emailVal(BlogAuthorEmail)),!BlogAuthorEmail)
        if (BlogAuthorEmail && !(await emailVal(BlogAuthorEmail))) {
            return next(new AppError("Email is invalid, please correct the email"))
        }

        if (BlogAuthorEmail && BlogAuthorEmail.includes("@acm.uss")) {
            return next(new AppError("Don't play smart, this type of email-address is reserved for the server use"))
        }


        let BlogImage = {}
        const createBlog = await Blog.create({ BlogTitle, BlogAuthor, BlogAuthorEmail, BlogContent, BlogCategory, BlogImage,ApprovedBy:"None" });

        if (!BlogAuthorEmail) {
            // const adminID = req.admin.adminID;
            // console.log()
            createBlog.BlogAuthorEmail = `${req.admin.adminID}@acm.uss`
        }

        if (req.file) {
            // console.log(req.file.path)
            // console.log(path.resolve(req.file.path))
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'blogs',
                    // width: 250, //in px
                    // height: 250,
                    // gravity: 'faces',
                    // crop: 'fill'

                });

                if (result) {
                    createBlog.BlogImage.public_id = result.public_id;
                    createBlog.BlogImage.secure_url = result.secure_url;

                    //removing file from local storage

                    // console.log(result.public_id, result.secure_url)
                    // console.log(req.url.path)
                    await fs.rm(req.file.path)

                }

            }
            catch (e) {
                // return next(new AppError(e.message))
                null

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


export const EditBlog = async (req, res, next) => {
    try {
        const { BlogID } = req.params
        const { BlogTitle, BlogAuthor, BlogAuthorEmail, BlogContent } = req.body

        let BlogCategory = req.body.BlogCategory;
        console.log(!!BlogCategory)
        if (!!BlogCategory) {
            BlogCategory = (function () {
                BlogCategory = BlogCategory.split(";");
                let CategoryArr = new Array();
                for (let category of BlogCategory){
                    let trimmed = category.trim();
                    
                    if (trimmed.length>0){
                        CategoryArr.push(trimmed)
                    }
                }

                return CategoryArr
            })()
        }

        // console.log(req.body,!BlogContent)
        if (!BlogContent) {
            return next(new AppError("Content not found or Empty. While we except the submission of empty details in Other Fields, we highly encourage You to submit a complete form"))
        }

        // console.log(BlogAuthorEmail,await emailVal(BlogAuthorEmail),BlogAuthorEmail && (await emailVal(BlogAuthorEmail)))
        // console.log(BlogAuthorEmail && !(await emailVal(BlogAuthorEmail)),!BlogAuthorEmail)
        if (BlogAuthorEmail && !(await emailVal(BlogAuthorEmail))) {
            return next(new AppError("Email is invalid, please correct the email"))
        }

        if (BlogAuthorEmail && BlogAuthorEmail.includes("@acm.uss")) {
            return next(new AppError("Don't play smart, this type of email-address is reserved for the server use"))
        }


        const dateTime = new Date();
        const date = (dateTime.toDateString()).split(" ");
        const LastUpdatedOn = `${date[2]} ${date[1]} ${date[3]}, ${date[0]}`

        const existingBlog = await Blog.findOneAndUpdate({ BlogID }, {
            $set: { ...req.body, LastUpdatedOn, BlogCategory,ApprovedBy:"None",Published:false }
        }, { runValidators: true })
        if (!existingBlog) {
            return next(new AppError("No Blog Associated with the passed BlogID"))
        }

        if (req.file) {
            console.log(existingBlog.BlogImage.public_id)
            await cloudinary.v2.uploader.destroy(existingBlog.BlogImage.public_id);
            console.log("image deleted")
            existingBlog.BlogImage.public_id = process.env.default_BlogImage_public_id;
            existingBlog.BlogImage.secure_url = process.env.default_BlogImage_secure_url;

            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'blogs'
                });

                if (result) {
                    existingBlog.BlogImage.public_id = result.public_id;
                    existingBlog.BlogImage.secure_url = result.secure_url;

                    //removing file from local storage

                    await fs.rm(req.file.path)

                }

            } catch (e) {
                // console.log("Image Goofed Up")
                null
            }

        }

        await existingBlog.save()


        let response = await Blog.findById(existingBlog._id)
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const DeleteBlog = async(req,res,next)=>{
    try{
        const { BlogID } = req.params

        const BlogExists = await Blog.findOneAndDelete({BlogID});

        if (!BlogExists){
            return next(new AppError("No blog is associated with this BlogID", 400))
        }

        let response = `Blog:${BlogID} is deleted successfully`;
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const GetBlog = async(req,res,next)=>{
    try{
        const { BlogID } = req.params

        const whatIDontWant = ["-__v","-_id","-createdAt","-updatedAt"].join(" ")
        const BlogExists = await Blog.findOne({BlogID}).select(whatIDontWant);

        if (!BlogExists){
            return next(new AppError("No blog is associated with this BlogID", 400))
        }

        let response = BlogExists;
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const approveBlog = async(req,res,next)=>{
    try{
        const { BlogID } = req.params
        console.log(req)
        const {adminID} = req.admin
        // console.log(AdminID)

        const whatIDontWant = ["-__v","-_id","-createdAt","-updatedAt"].join(" ")
        const BlogExists = await Blog.findOneAndUpdate({BlogID},{
            $set:{ApprovedBy:adminID}
        }).select(whatIDontWant);

        if (!BlogExists){
            return next(new AppError("No blog is associated with this BlogID", 400))
        }

        let response = "Approved";
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const rejectBlog = async(req,res,next)=>{
    try{
        const { BlogID } = req.params

        const whatIDontWant = ["-__v","-_id","-createdAt","-updatedAt"].join(" ")
        const BlogExists = await Blog.findOneAndUpdate({BlogID},{
            $set:{ApprovedBy:"None",Published:false}
        }).select(whatIDontWant);

        if (!BlogExists){
            return next(new AppError("No blog is associated with this BlogID", 400))
        }

        let response = "Blog Approval is REVOKED. It will also be UNPUBLISH";
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const PublishBlog = async(req,res,next)=>{
    try{
        const { BlogID } = req.params
        const {AdminID} = req.admin

        // const whatIDontWant = ["-__v","-_id","-createdAt","-updatedAt"].join(" ")
        const BlogExists = await Blog.findOneAndUpdate({BlogID},{
            $set:{Published:true}
        });

        if (!BlogExists){
            return next(new AppError("No blog is associated with this BlogID", 400))
        }

        if (BlogExists.FirstPublishedOn == process.env.default_FirstPublishedOn){
            const dateTime = new Date();
            const date = (dateTime.toDateString()).split(" ");
        
            BlogExists.FirstPublishedOn = `${date[2]} ${date[1]} ${date[3]}, ${date[0]}`
            await BlogExists.save()
        }

        console.log()

        let response = "Blog is Published";
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const UnpublishBlog = async(req,res,next)=>{
    try{
        const { BlogID } = req.params

        const whatIDontWant = ["-__v","-_id","-createdAt","-updatedAt"].join(" ")
        const BlogExists = await Blog.findOneAndUpdate({BlogID},{
            $set:{Published:false}
        }).select(whatIDontWant);

        if (!BlogExists){
            return next(new AppError("No blog is associated with this BlogID", 400))
        }

        let response = "Blog is UNPUBLISHED";
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}
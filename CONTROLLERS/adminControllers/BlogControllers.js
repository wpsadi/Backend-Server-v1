// this file contains all the routes of Blogs

import { emailVal } from "../../UTILITY/emailVal.js";
import AppError from "../../UTILITY/errClass.js";
import "../../environment.js"
import { Blog } from "../../SCHEMA/blogSchema.js";
import fs from "fs/promises"
import cloudinary from "cloudinary"
import sendEmail from "../../UTILITY/finalMailService.js";

//Blogs-AdminRoutes

export const CreateBlog = async (req, res, next) => {
    try {

        const { BlogTitle, BlogAuthor, BlogAuthorEmail, BlogContent } = req.body

        let BlogCategory = req.body.BlogCategory;
        if (!!BlogCategory) {
            BlogCategory = (function () {
                BlogCategory = BlogCategory.split(";");
                let CategoryArr = new Array();
                for (let category of BlogCategory) {
                    let trimmed = category.trim();

                    if (trimmed.length > 0) {
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
        const createBlog = await Blog.create({ BlogTitle, BlogAuthor, BlogAuthorEmail, BlogContent, BlogCategory, BlogImage, ApprovedBy: "None" });

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
        // console.log(!!BlogCategory)
        if (!!BlogCategory) {
            BlogCategory = (function () {
                BlogCategory = BlogCategory.split(";");
                let CategoryArr = new Array();
                for (let category of BlogCategory) {
                    let trimmed = category.trim();

                    if (trimmed.length > 0) {
                        CategoryArr.push(trimmed)
                    }
                }

                return CategoryArr
            })()
        }

        // console.log(req.body,!BlogContent)
        // if (!BlogContent) {
        //     return next(new AppError("Content not found or Empty. While we except the submission of empty details in Other Fields, we highly encourage You to submit a complete form"))
        // }

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
            $set: { ...req.body, LastUpdatedOn, BlogCategory, ApprovedBy: "None", Published: false,Approved:false }
        }, { runValidators: true })
        if (!existingBlog) {
            return next(new AppError("No Blog Associated with the passed BlogID"))
        }

        if (req.file) {
            // console.log(existingBlog.BlogImage.public_id)
            await cloudinary.v2.uploader.destroy(existingBlog.BlogImage.public_id);
            // console.log("image deleted")
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

export const DeleteBlog = async (req, res, next) => {
    try {
        const { BlogID } = req.params

        const BlogExists = await Blog.findOneAndDelete({ BlogID });

        if (!BlogExists) {
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

export const GetBlog = async (req, res, next) => {
    try {
        const { BlogID } = req.params

        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
        const BlogExists = await Blog.findOne({ BlogID }).select(whatIDontWant);

        if (!BlogExists) {
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

export const GetSpecificData = async(req,res,next) => {
    try{
        const {BlogID,propertyToRetrieve} = req.params;

        const whatIDontWant = ["-__v", "-_id" , "-createdAt", "-updatedAt"].join(" ")
        const BlogExists = await Blog.findOne({ BlogID}).select(whatIDontWant);

        if (!BlogExists) {
            return next(new AppError("No blog is associated with this BlogID", 400))
        }

        const propertyAllowedToRetrieve = (()=>{
            let toRemove = whatIDontWant.split(" ")
            toRemove = toRemove.map(prop => prop.slice(1,prop.length))

            let arr = new Array();
            let allAvailable = Object.keys(Blog.schema.obj)

            for (let x of allAvailable){
                if (!toRemove.includes(x)){
                    arr.push(x)
                }
            }
            return arr
        })()

        if (!BlogExists[propertyToRetrieve] || !propertyAllowedToRetrieve.includes(propertyToRetrieve)){
            return next(new AppError("No value found"))
        }

        let response = BlogExists[propertyToRetrieve];
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



export const approveBlog = async (req, res, next) => {
    try {
        const { BlogID } = req.params
        // console.log(req)
        const { adminID } = req.admin
        // console.log(AdminID)

        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
        const BlogExists = await Blog.findOneAndUpdate({ BlogID }, {
            $set: { ApprovedBy: adminID,Approved:true }
        }).select(whatIDontWant);

        if (!BlogExists) {
            return next(new AppError("No blog is associated with this BlogID", 400))
        }

        if (BlogExists.Approved = true){
            return next(new AppError("Already approved"))
        }

        sendEmail(req.adminDetails.AdminEmail,"[To Inform]: Blog Approved",`Hi ${req.adminDetails.AdminName}, you have approved a blog with:<br>Blog ID : <b>${BlogID}</b><br>Titled : ${BlogExists.BlogTitle}`)

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

export const rejectBlog = async (req, res, next) => {
    try {
        const { BlogID } = req.params

        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
        const BlogExists = await Blog.findOneAndUpdate({ BlogID }, {
            $set: { ApprovedBy: "None", Published: false ,Approved:false}
        }).select(whatIDontWant);

        if (!BlogExists) {
            return next(new AppError("No blog is associated with this BlogID", 400))
        }

        if (BlogExists.ApprovedBy == "None" && BlogExists.Published == false && BlogExists.Approved == false){
            return next(new AppError("Already Rejected"))
        }

        sendEmail(req.adminDetails.AdminEmail,"[To Inform]: Blog Rejected",`Hi ${req.adminDetails.AdminName}, you have rejected a blog with:<br>Blog ID : <b>${BlogID}</b><br>Titled : ${BlogExists.BlogTitle}<br><br>${Published && "It is also UNPUBLISHED"}`)


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

export const PublishBlog = async (req, res, next) => {
    try {
        const { BlogID } = req.params

        const { adminID } = req.admin
        // console.log(AdminID)

        const whatIDontWant = ["-__v","-_id","-createdAt","-updatedAt"].join(" ")

        const checkIfApproved = await Blog.findOne({BlogID});
        if (!checkIfApproved) {
            return next(new AppError("No blog is associated with this BlogID", 400))
        }

        let set ={}

        if (!checkIfApproved.Approved){
            set = { Published: true , ApprovedBy: adminID,Approved:true }
        }

        else{
            set = { Published: true}

        }

        const BlogExists = await Blog.findOneAndUpdate({ BlogID }, {
            $set: set
        });



        if (BlogExists.FirstPublishedOn == process.env.default_FirstPublishedOn) {
            const dateTime = new Date();
            const date = (dateTime.toDateString()).split(" ");

            BlogExists.FirstPublishedOn = `${date[2]} ${date[1]} ${date[3]}, ${date[0]}`

            await BlogExists.save()
            
        }

        if (BlogExists.Published == true){
            return next(new AppError("Already Published"))
        }


        sendEmail(req.adminDetails.AdminEmail,`[To Inform]: Blog[${BlogID}] Published`,`Hi ${req.adminDetails.AdminName}, you have published a blog with:<br>Blog ID : <b>${BlogID}</b><br>Titled : ${BlogExists.BlogTitle}`)


        let response = "Blog is Approved and Published";
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const UnpublishBlog = async (req, res, next) => {
    try {
        const { BlogID } = req.params

        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
        const BlogExists = await Blog.findOneAndUpdate({ BlogID }, {
            $set: { Published: false }
        }).select(whatIDontWant);

        if (!BlogExists) {
            return next(new AppError("No blog is associated with this BlogID", 400))
        }

        if (BlogExists.Published == false){
            return next(new AppError("Already UnPublished"))
        }


        sendEmail(req.adminDetails.AdminEmail,`[To Inform]: Blog[${BlogID}] UnPublished`,`Hi ${req.adminDetails.AdminName}, you have <u>unpublished</u> a blog with:<br>Blog ID : <b>${BlogID}</b><br>Titled : ${BlogExists.BlogTitle}`)


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

export const paginationBlogs = async (req, res, next) => {

    try {
        let { limit, pageNo,order } = req.params;
        limit = Number(limit);
        pageNo = Number(pageNo);

        const totalBlogs = await Blog.countDocuments();
        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")

        if (!isNaN(limit) && !isNaN(pageNo) && limit > 0 && pageNo > 0) {

            if (!["desc",null,"asce"].includes(order)){
                return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
            }

            order = ["desc",null,"asce"].indexOf(order) - 1




            let rem = totalBlogs % limit;
            let div = (totalBlogs - rem) / limit

            let totalPages = div

            if (rem > 0) {
                totalPages++
            }

            if (pageNo > totalPages) {
                return next(new AppError("No more page is available", 400))
            }

            let next_url = null;
            let prev_url = null;


            const baseURL = `${req.protocol}://${req.get("host")}${req.originalUrl}`.split("/")
            if (pageNo >= 1 && pageNo < totalPages) {
                baseURL[baseURL.length - 2] = `${pageNo + 1}`
                
                next_url = baseURL.join("/")
            }

            if (pageNo > 1 && pageNo <= totalPages) {
                baseURL[baseURL.length - 2] = `${pageNo - 1}`
                prev_url = baseURL.join("/")
            }


            const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
            const response = await Blog.find().select(whatIDontWant).limit(limit).skip(limit*(pageNo-1)).sort({BlogID : order});

            res.status(201).json({
                status: true,
                res_type: typeof response,
                total_records: totalBlogs,
                next_url,
                prev_url,
                response: response
            })
        }
        else {
            return next(new AppError("limit and pageNo must be positive numbers", 400))
        }
    } catch (e) {
        return next(new AppError(e.message, 400))
    }

}



export const AllpaginationBlogs = async (req, res, next) => {
    try {
        const { limit} = req.params;

        let {order} = req.params
        
        if (!["desc",null,"asce"].includes(order)){
            return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
        }

        order = ["desc",null,"asce"].indexOf(order) - 1


        const totalBlogs = await Blog.countDocuments();
        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")

        if (limit == process.env.allBlogsKeyword) {

            let response = await Blog.find().select(whatIDontWant).sort({BlogID : order});
            res.status(201).json({
                status: true,
                res_type: typeof response,
                total_records: totalBlogs,
                response: response
            })
        }
        else {
            return next(new AppError(`use \`${process.env.allBlogsKeyword}\` at the place of limit to get all records.`, 400))
        }
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const paginationApprovedBlogs = async(req,res,next)=>{
        try {
        let { limit, pageNo,order } = req.params;
        limit = Number(limit);
        pageNo = Number(pageNo);

        const totalBlogs = await Blog.countDocuments({Approved:true });
        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")

        if (!isNaN(limit) && !isNaN(pageNo) && limit > 0 && pageNo > 0) {

            if (!["desc",null,"asce"].includes(order)){
                return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
            }

            order = ["desc",null,"asce"].indexOf(order) - 1



            let rem = totalBlogs % limit;
            let div = (totalBlogs - rem) / limit

            let totalPages = div

            if (rem > 0) {
                totalPages++
            }

            if (pageNo > totalPages) {
                return next(new AppError("No more page is available", 400))
            }

            let next_url = null;
            let prev_url = null;


            const baseURL = `${req.protocol}://${req.get("host")}${req.originalUrl}`.split("/")
            if (pageNo >= 1 && pageNo < totalPages) {
                baseURL[baseURL.length - 2] = `${pageNo + 1}`
                next_url = baseURL.join("/")
            }

            if (pageNo > 1 && pageNo <= totalPages) {
                baseURL[baseURL.length - 2] = `${pageNo - 1}`
                prev_url = baseURL.join("/")
            }

            let minNumber = (limit * (pageNo-1))+1;
            if (minNumber <= 0) {
                minNumber = 1
            }

            let maxNumber = (limit * pageNo)


            const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
            const response = await Blog.find({Approved:true }).select(whatIDontWant).limit(limit).skip(limit*(pageNo-1)).sort({BlogID : order});

            res.status(201).json({
                status: true,
                res_type: typeof response,
                total_records: totalBlogs,
                next_url,
                prev_url,
                response: response
            })
        }
        else {
            return next(new AppError("limit and pageNo must be positive numbers", 400))
        }
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const AllpaginationApprovedBlogs = async(req,res,next)=>{
    try {
        const { limit } = req.params;

        let {order} = req.params

        const totalBlogs = await Blog.countDocuments({Approved:true});
        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")

        if (limit == process.env.allBlogsKeyword) {

            if (!["desc",null,"asce"].includes(order)){
                return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
            }

            order = ["desc",null,"asce"].indexOf(order) - 1


            let response = await Blog.find({Approved:true}).select(whatIDontWant).sort({BlogID : order});
            res.status(201).json({
                status: true,
                res_type: typeof response,
                total_records: totalBlogs,
                response: response
            })
        }
        else {
            return next(new AppError(`use \`${process.env.allBlogsKeyword}\` at the place of limit to get all records.`, 400))
        }
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const paginationRejectedBlogs = async(req,res,next)=>{
    try {
    let { limit, pageNo,order } = req.params;
    limit = Number(limit);
    pageNo = Number(pageNo);

    const totalBlogs = await Blog.countDocuments({Approved:false});
    const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")

    if (!isNaN(limit) && !isNaN(pageNo) && limit > 0 && pageNo > 0) {

        if (!["desc",null,"asce"].includes(order)){
            return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
        }

        order = ["desc",null,"asce"].indexOf(order) - 1


        let rem = totalBlogs % limit;
        let div = (totalBlogs - rem) / limit

        let totalPages = div

        if (rem > 0) {
            totalPages++
        }

        if (pageNo > totalPages) {
            return next(new AppError("No more page is available", 400))
        }

        let next_url = null;
        let prev_url = null;


        const baseURL = `${req.protocol}://${req.get("host")}${req.originalUrl}`.split("/")
        if (pageNo >= 1 && pageNo < totalPages) {
            baseURL[baseURL.length - 2] = `${pageNo + 1}`
            next_url = baseURL.join("/")
        }

        if (pageNo > 1 && pageNo <= totalPages) {
            baseURL[baseURL.length - 2] = `${pageNo - 1}`
            prev_url = baseURL.join("/")
        }

        let minNumber = (limit * (pageNo-1))+1;
        if (minNumber <= 0) {
            minNumber = 1
        }

        let maxNumber = (limit * pageNo)


        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
        const response = await Blog.find({Approved:false }).select(whatIDontWant).limit(limit).skip(limit*(pageNo-1)).sort({BlogID : order});

        res.status(201).json({
            status: true,
            res_type: typeof response,
            total_records: totalBlogs,
            next_url,
            prev_url,
            response: response
        })
    }
    else {
        return next(new AppError("limit and pageNo must be positive numbers", 400))
    }
} catch (e) {
    return next(new AppError(e.message, 400))
}
}

export const AllpaginationRejectedBlogs = async(req,res,next)=>{
try {
    const { limit } = req.params;

    let {order} = req.params

    if (!["desc",null,"asce"].includes(order)){
        return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
    }

    order = ["desc",null,"asce"].indexOf(order) - 1


    const totalBlogs = await Blog.countDocuments({Approved:false});
    const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")

    if (limit == process.env.allBlogsKeyword) {

        let response = await Blog.find({Approved:false}).select(whatIDontWant).sort({BlogID : order});
        res.status(201).json({
            status: true,
            res_type: typeof response,
            total_records: totalBlogs,
            response: response
        })
    }
    else {
        return next(new AppError(`use \`${process.env.allBlogsKeyword}\` at the place of limit to get all records.`, 400))
    }
} catch (e) {
    return next(new AppError(e.message, 400))
}
}

export const paginationPublishedBlogs = async(req,res,next)=>{
    try {
    let { limit, pageNo,order } = req.params;
    limit = Number(limit);
    pageNo = Number(pageNo);

    const totalBlogs = await Blog.countDocuments({Approved:false});
    const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")

    if (!isNaN(limit) && !isNaN(pageNo) && limit > 0 && pageNo > 0) {

        if (!["desc",null,"asce"].includes(order)){
            return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
        }

        order = ["desc",null,"asce"].indexOf(order) - 1


        let rem = totalBlogs % limit;
        let div = (totalBlogs - rem) / limit

        let totalPages = div

        if (rem > 0) {
            totalPages++
        }

        if (pageNo > totalPages) {
            return next(new AppError("No more page is available", 400))
        }

        let next_url = null;
        let prev_url = null;


        const baseURL = `${req.protocol}://${req.get("host")}${req.originalUrl}`.split("/")
        if (pageNo >= 1 && pageNo < totalPages) {
            baseURL[baseURL.length - 2] = `${pageNo + 1}`
            next_url = baseURL.join("/")
        }

        if (pageNo > 1 && pageNo <= totalPages) {
            baseURL[baseURL.length - 2] = `${pageNo - 1}`
            prev_url = baseURL.join("/")
        }

        let minNumber = (limit * (pageNo-1))+1;
        if (minNumber <= 0) {
            minNumber = 1
        }

        let maxNumber = (limit * pageNo)


        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
        const response = await Blog.find({Published:true }).select(whatIDontWant).limit(limit).skip(limit*(pageNo-1)).sort({BlogID : order});

        res.status(201).json({
            status: true,
            res_type: typeof response,
            total_records: totalBlogs,
            next_url,
            prev_url,
            response: response
        })
    }
    else {
        return next(new AppError("limit and pageNo must be positive numbers", 400))
    }
} catch (e) {
    return next(new AppError(e.message, 400))
}
}

export const AllpaginationPublishedBlogs = async(req,res,next)=>{
try {
    const { limit } = req.params;

    let {order} = req.params

    if (!["desc",null,"asce"].includes(order)){
        return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
    }

    order = ["desc",null,"asce"].indexOf(order) - 1


    const totalBlogs = await Blog.countDocuments({Approved:false});
    const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")

    if (limit == process.env.allBlogsKeyword) {

        let response = await Blog.find({Published:true}).select(whatIDontWant).sort({BlogID : order});
        res.status(201).json({
            status: true,
            res_type: typeof response,
            total_records: totalBlogs,
            response: response
        })
    }
    else {
        return next(new AppError(`use \`${process.env.allBlogsKeyword}\` at the place of limit to get all records.`, 400))
    }
} catch (e) {
    return next(new AppError(e.message, 400))
}
}

export const paginationUnpublishedBlogs = async(req,res,next)=>{
    try {
    let { limit, pageNo,order } = req.params;
    limit = Number(limit);
    pageNo = Number(pageNo);

    const totalBlogs = await Blog.countDocuments({Approved:false});
    const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")

    if (!isNaN(limit) && !isNaN(pageNo) && limit > 0 && pageNo > 0) {

        if (!["desc",null,"asce"].includes(order)){
            return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
        }

        order = ["desc",null,"asce"].indexOf(order) - 1


        let rem = totalBlogs % limit;
        let div = (totalBlogs - rem) / limit

        let totalPages = div

        if (rem > 0) {
            totalPages++
        }

        if (pageNo > totalPages) {
            return next(new AppError("No more page is available", 400))
        }

        let next_url = null;
        let prev_url = null;


        const baseURL = `${req.protocol}://${req.get("host")}${req.originalUrl}`.split("/")
        if (pageNo >= 1 && pageNo < totalPages) {
            baseURL[baseURL.length - 2] = `${pageNo + 1}`
            next_url = baseURL.join("/")
        }

        if (pageNo > 1 && pageNo <= totalPages) {
            baseURL[baseURL.length - 2] = `${pageNo - 1}`
            prev_url = baseURL.join("/")
        }

        let minNumber = (limit * (pageNo-1))+1;
        if (minNumber <= 0) {
            minNumber = 1
        }

        let maxNumber = (limit * pageNo)


        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
        const response = await Blog.find({Published:false }).select(whatIDontWant).limit(limit).skip(limit*(pageNo-1)).sort({BlogID : order});

        res.status(201).json({
            status: true,
            res_type: typeof response,
            total_records: totalBlogs,
            next_url,
            prev_url,
            response: response
        })
    }
    else {
        return next(new AppError("limit and pageNo must be positive numbers", 400))
    }
} catch (e) {
    return next(new AppError(e.message, 400))
}
}

export const AllpaginationUnpublishedBlogs = async(req,res,next)=>{
try {
    const { limit } = req.params;

    let {order} = req.params

    if (!["desc",null,"asce"].includes(order)){
        return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
    }

    order = ["desc",null,"asce"].indexOf(order) - 1


    const totalBlogs = await Blog.countDocuments({Approved:false});
    const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")

    if (limit == process.env.allBlogsKeyword) {

        let response = await Blog.find({Published:false}).select(whatIDontWant).sort({BlogID : order});
        res.status(201).json({
            status: true,
            res_type: typeof response,
            total_records: totalBlogs,
            response: response
        })
    }
    else {
        return next(new AppError(`use \`${process.env.allBlogsKeyword}\` at the place of limit to get all records.`, 400))
    }
} catch (e) {
    return next(new AppError(e.message, 400))
}
}


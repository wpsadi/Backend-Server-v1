import { Announcement} from "../../SCHEMA/AnouncementSchema.js"
import marked from "../../UTILITY/Mark_to_html.js"
import { deleteFromGitHub, uploadToGitHub } from "../../UTILITY/SaveImageOnGit.js"
import AppError from "../../UTILITY/errClass.js"
import "../../environment.js"
import fs from "fs/promises"
import cloudinary from "cloudinary"


export const CreateAnnouncement = async (req, res, next) => {
    try {

        const { AnnouncementTitle, AnnouncementContent } = req.body

        // console.log(req.body,!AnnouncementContent)
        if (!AnnouncementContent) {
            return next(new AppError("Content OR Title not found"))
        }

        let AnnouncementImage = {}
        const CreateAnnouncement = await Announcement.create({ AnnouncementTitle, AnnouncementContent:marked(AnnouncementContent).trim().split("\n").join(""), AnnouncementImage,AnnouncementCreatedBy:`${req.admin.adminID}`});


        if (req.file) {
            try{
                const saveOnGit = await uploadToGitHub(req.file.path,`announcements/${req.file.filename}`)
                if (saveOnGit){
                    CreateAnnouncement.AnnouncementImage.rawgit_url = saveOnGit
                }

            }
            catch(e){
                // return next(new AppError(e.message))
                null
            }

            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'announcements',
                    // width: 250, //in px
                    // height: 250,
                    // gravity: 'faces',
                    // crop: 'fill'

                });

                if (result) {
                    CreateAnnouncement.AnnouncementImage.public_id = result.public_id;
                    CreateAnnouncement.AnnouncementImage.secure_url = result.secure_url;

                    //removing file from local storage

                    // console.log(result.public_id, result.secure_url)
                    // console.log(req.url.path)
                   

                }

            }
            catch (e) {
                null
                // return next(new AppError(e.message))

            }
            await fs.rm(req.file.path)

        }

        await CreateAnnouncement.save() 




        // let response = createAnnouncement
        let response = await Announcement.findById(CreateAnnouncement._id)
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }



}

export const EditAnnouncement = async (req, res, next) => {
    try {
        const { AnnouncementID } = req.params
        const { AnnouncementTitle } = req.body
        req.body["AnnouncementContent"] = marked(req.body["AnnouncementContent"]).trim().split("\n").join("")
        const {AnnouncementContent} = req.body;
        req.body = {AnnouncementTitle, AnnouncementContent}

        const dateTime = new Date();
        const date = (dateTime.toDateString()).split(" ");
        const LastUpdatedOn = `${date[2]} ${date[1]} ${date[3]}, ${date[0]}`

        const existingAnnouncement = await Announcement.findOneAndUpdate({ AnnouncementID }, {
            $set: {...req.body, LastUpdatedOn }
        }, { runValidators: true })
        if (!existingAnnouncement) {
            return next(new AppError("No Announcement Associated with the passed AnnouncementID"))
        }

        if (req.file) {
            await cloudinary.v2.uploader.destroy(existingAnnouncement.AnnouncementImage.public_id);
            // console.log("image deleted")
            existingAnnouncement.AnnouncementImage.public_id = process.env.default_AnnouncementImage_public_id;
            existingAnnouncement.AnnouncementImage.secure_url = process.env.default_AnnouncementImage_secure_url;


            //deleting file from github
            let address_in_rep = existingAnnouncement.AnnouncementImage.rawgit_url.split("/")
            address_in_rep = address_in_rep.slice(address_in_rep.length-2,address_in_rep.length).join("/")
            let deleteIfFileExist = await deleteFromGitHub(address_in_rep) 
            if (deleteIfFileExist){
                existingAnnouncement.AnnouncementImage.secure_url = process.env.default_AnnouncementImage_rawgit_url;
            }
            //reuploading filee
            try{
                const saveOnGit = await uploadToGitHub(req.file.path,`announcements/${req.file.filename}`)
                if (saveOnGit){
                    existingAnnouncement.AnnouncementImage.rawgit_url = saveOnGit
                }
            }
            catch(e){
                return next(new AppError(e.message))
            }


            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'announcements'
                });

                if (result) {
                    existingAnnouncement.AnnouncementImage.public_id = result.public_id;
                    existingAnnouncement.AnnouncementImage.secure_url = result.secure_url;

                    //removing file from local storage

                    

                }

            } catch (e) {
                // console.log("Image Goofed Up")
                null
            }

            await fs.rm(req.file.path)

        }

        await existingAnnouncement.save()


        let response = await Announcement.findById(existingAnnouncement._id)
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}


export const DeleteAnnouncement = async (req, res, next) => {
    try {
        const { AnnouncementID } = req.params

        const AnnouncementExists = await Announcement.findOneAndDelete({ AnnouncementID });

        if (!AnnouncementExists) {
            return next(new AppError("No Announcement is associated with this AnnouncementID", 400))
        }

        let response = `Announcement:${AnnouncementID} is deleted successfully`;
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const GetAnnouncement = async (req, res, next) => {
    try {
        const { AnnouncementID } = req.params

        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
        const AnnouncementExists = await Announcement.findOne({ AnnouncementID }).select(whatIDontWant);

        if (!AnnouncementExists) {
            return next(new AppError("No Announcement is associated with this AnnouncementID", 400))
        }

        let response = AnnouncementExists;
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const GetSpecificDataAnnoucement = async(req,res,next) => {
    try{
        const {AnnouncementID,propertyToRetrieve} = req.params;

        const whatIDontWant = ["-__v", "-_id" , "-createdAt", "-updatedAt"].join(" ")
        const AnnouncementExists = await Announcement.findOne({ AnnouncementID}).select(whatIDontWant);

        if (!AnnouncementExists) {
            return next(new AppError("No Announcement is associated with this AnnouncementID", 400))
        }

        const propertyAllowedToRetrieve = (()=>{
            let toRemove = whatIDontWant.split(" ")
            toRemove = toRemove.map(prop => prop.slice(1,prop.length))

            let arr = new Array();
            let allAvailable = Object.keys(Announcement.schema.obj)

            for (let x of allAvailable){
                if (!toRemove.includes(x)){
                    arr.push(x)
                }
            }
            return arr
        })()

        if (!AnnouncementExists[propertyToRetrieve] || !propertyAllowedToRetrieve.includes(propertyToRetrieve)){
            return next(new AppError("No value found"))
        }

        let response = AnnouncementExists[propertyToRetrieve];
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

export const paginationAnnouncements = async (req, res, next) => {

    try {
        let { limit, pageNo,order } = req.params;
        limit = Number(limit);
        pageNo = Number(pageNo);

        const totalAnnouncements = await Announcement.countDocuments();
        const whatIDontWant = ["-__v", "-createdAt", "-updatedAt"].join(" ")

        if (!isNaN(limit) && !isNaN(pageNo) && limit > 0 && pageNo > 0) {

            if (!["desc",null,"asce"].includes(order)){
                return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
            }

            order = ["desc",null,"asce"].indexOf(order) - 1




            let rem = totalAnnouncements % limit;
            let div = (totalAnnouncements - rem) / limit

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


            const whatIDontWant = ["-__v", "-createdAt", "-updatedAt"].join(" ")
            const response = await Announcement.find().select(whatIDontWant).limit(limit).skip(limit*(pageNo-1)).sort({AnnouncementID : order});

            res.status(201).json({
                status: true,
                res_type: typeof response,
                total_records: totalAnnouncements,
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
 
export const AllpaginationAnnouncements = async (req, res, next) => {
    try {
        const { limit} = req.params;

        let {order} = req.params
        
        if (!["desc",null,"asce"].includes(order)){
            return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
        }

        order = ["desc",null,"asce"].indexOf(order) - 1


        const totalAnnouncements = await Announcement.countDocuments();
        const whatIDontWant = ["-__v", "-createdAt", "-updatedAt"].join(" ")

        if (limit == process.env.allAnnouncementsKeyword) {

            let response = await Announcement.find().select(whatIDontWant).sort({AnnouncementID : order});
            res.status(201).json({
                status: true,
                res_type: typeof response,
                total_records: totalAnnouncements,
                response: response
            })
        }
        else {
            return next(new AppError(`use \`${process.env.allAnnouncementsKeyword}\` at the place of limit to get all records.`, 400))
        }
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}
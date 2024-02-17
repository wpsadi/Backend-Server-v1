import isURL from "is-url";
import { Link } from "../../SCHEMA/linkGenSchema.js";
import "../../environment.js"
import axios from "axios"
import AppError from "../../UTILITY/errClass.js";

export const SendLink = async (req, res, next) => {
    try {
        const { ID } = req.params

        const LinkLink = await Link.findById(ID)
        if (!LinkLink) {
            return next(new AppError("No Link is associated with this ID "))
        }

        const link = LinkLink.URLToLink;

        res.redirect(link)
    } catch (e) {
        return next(new AppError(e.message));
    }
}

export const CreateLink = async (req, res, next) => {
    try {

        const { LinkPurpose, URLToLink } = req.body

        // console.log(req.body,!LinkContent)
        if (!URLToLink || !LinkPurpose) {
            return next(new AppError("URLToLink OR Purpose not found"))
        }

        if (!isURL(URLToLink)) {
            return next(new AppError("URLToLink contains a text, enter a link there"))
        }

        const CreateLink = await Link.create({ LinkPurpose, URLToLink: URLToLink, LinkCreatedBy: `${req.admin.adminID}` });


        // let response = createLink
        let response = `${process.env.send_URL_sendLink}${CreateLink._id}`
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }



}

export const EditLink = async (req, res, next) => {
    try {
        const { LinkID } = req.params
        const { LinkPurpose, URLToLink } = req.body

        req.body = { LinkPurpose, URLToLink }

        const dateTime = new Date();
        const date = (dateTime.toDateString()).split(" ");
        const LastUpdatedOn = `${date[2]} ${date[1]} ${date[3]}, ${date[0]}`

        const existingLink = await Link.findOneAndUpdate({ LinkID }, {
            $set: { ...req.body, LastUpdatedOn }
        }, { runValidators: true })
        if (!existingLink) {
            return next(new AppError("No Link Associated with the passed LinkID"))
        }

        let response = `${process.env.send_URL_sendLink}${existingLink._id}`
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}


export const DeleteLink = async (req, res, next) => {
    try {
        const { LinkID } = req.params

        const LinkExists = await Link.findOneAndDelete({ LinkID });

        if (!LinkExists) {
            return next(new AppError("No Link is associated with this LinkID", 400))
        }

        let response = `Link:${LinkID} is deleted successfully`;
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const GetLink = async (req, res, next) => {
    try {
        const { LinkID } = req.params

        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
        const LinkExists = await Link.findOne({ LinkID }).select(whatIDontWant);

        if (!LinkExists) {
            return next(new AppError("No Link is associated with this LinkID", 400))
        }

        let response = LinkExists;
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const GetSpecificDataLink = async (req, res, next) => {
    try {
        const { LinkID, propertyToRetrieve } = req.params;

        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
        const LinkExists = await Link.findOne({ LinkID }).select(whatIDontWant);

        if (!LinkExists) {
            return next(new AppError("No Link is associated with this LinkID", 400))
        }

        const propertyAllowedToRetrieve = (() => {
            let toRemove = whatIDontWant.split(" ")
            toRemove = toRemove.map(prop => prop.slice(1, prop.length))

            let arr = new Array();
            let allAvailable = Object.keys(Link.schema.obj)

            for (let x of allAvailable) {
                if (!toRemove.includes(x)) {
                    arr.push(x)
                }
            }
            return arr
        })()

        if (!LinkExists[propertyToRetrieve] || !propertyAllowedToRetrieve.includes(propertyToRetrieve)) {
            return next(new AppError("No value found"))
        }

        let response = LinkExists[propertyToRetrieve];
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

export const paginationLinks = async (req, res, next) => {

    try {
        let { limit, pageNo, order } = req.params;
        limit = Number(limit);
        pageNo = Number(pageNo);

        const totalLinks = await Link.countDocuments();
        const whatIDontWant = ["-__v", "-createdAt", "-updatedAt"].join(" ")

        if (!isNaN(limit) && !isNaN(pageNo) && limit > 0 && pageNo > 0) {

            if (!["desc", null, "asce"].includes(order)) {
                return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
            }

            order = ["desc", null, "asce"].indexOf(order) - 1




            let rem = totalLinks % limit;
            let div = (totalLinks - rem) / limit

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
            const response = await Link.find().select(whatIDontWant).limit(limit).skip(limit * (pageNo - 1)).sort({ LinkID: order });

            res.status(201).json({
                status: true,
                res_type: typeof response,
                total_records: totalLinks,
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

export const AllpaginationLinks = async (req, res, next) => {
    try {
        const { limit } = req.params;

        let { order } = req.params

        if (!["desc", null, "asce"].includes(order)) {
            return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
        }

        order = ["desc", null, "asce"].indexOf(order) - 1


        const totalLinks = await Link.countDocuments();
        const whatIDontWant = ["-__v", "-createdAt", "-updatedAt"].join(" ")

        if (limit == process.env.allLinksKeyword) {

            let response = await Link.find().select(whatIDontWant).sort({ LinkID: order });
            res.status(201).json({
                status: true,
                res_type: typeof response,
                total_records: totalLinks,
                response: response
            })
        }
        else {
            return next(new AppError(`use \`${process.env.allLinksKeyword}\` at the place of limit to get all records.`, 400))
        }
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}
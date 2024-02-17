import isURL from "is-url";
import { Form } from "../../SCHEMA/FormSchema.js";
import "../../environment.js"
import axios from "axios"
import AppError from "../../UTILITY/errClass.js";

export const SendForm = async (req, res, next) => {
    try {
        const { ID } = req.params

        const FormLink = await Form.findById(ID)
        if (!FormLink) {
            return next(new AppError("No Form is associated with this ID "))
        }

        const link = FormLink.URLToForm;
        const jsCode = `
        const iframe = document.getElementById('myIframe')
        // Check if the iframe is accessible
        if (!iframe && iframe.contentWindow && iframe.contentWindow.document) {
            // Redirect the user to the actual URL of the document
            window.location.href = "${link}";
        }
    `;

        const html = `
        <iframe id="myIframe" src="${link}" style="height:100vh;margin:-12px -12px;width:100vw;overflow:scroll"></iframe>
        <script>
            ${jsCode}
        </script>
    `;
        // Send the response from the proxied request
        res.send(html);
    } catch (e) {
        return next(new AppError(e.message));
    }
}

export const CreateForm = async (req, res, next) => {
    try {

        const { FormPurpose, URLToForm } = req.body

        // console.log(req.body,!FormContent)
        if (!URLToForm || !FormPurpose) {
            return next(new AppError("URLToForm OR Purpose not found"))
        }

        if (!isURL(URLToForm)) {
            return next(new AppError("URLToForm contains a text, enter a link there"))
        }

        const CreateForm = await Form.create({ FormPurpose, URLToForm: URLToForm, FormCreatedBy: `${req.admin.adminID}` });


        // let response = createForm
        let response = `${process.env.send_URL_sendForm}${CreateForm._id}`
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }



}

export const EditForm = async (req, res, next) => {
    try {
        const { FormID } = req.params
        const { FormPurpose, URLToForm } = req.body

        req.body = { FormPurpose, URLToForm }

        const dateTime = new Date();
        const date = (dateTime.toDateString()).split(" ");
        const LastUpdatedOn = `${date[2]} ${date[1]} ${date[3]}, ${date[0]}`

        const existingForm = await Form.findOneAndUpdate({ FormID }, {
            $set: { ...req.body, LastUpdatedOn }
        }, { runValidators: true })
        if (!existingForm) {
            return next(new AppError("No Form Associated with the passed FormID"))
        }

        let response = `${process.env.send_URL_sendForm}${existingForm._id}`
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}


export const DeleteForm = async (req, res, next) => {
    try {
        const { FormID } = req.params

        const FormExists = await Form.findOneAndDelete({ FormID });

        if (!FormExists) {
            return next(new AppError("No Form is associated with this FormID", 400))
        }

        let response = `Form:${FormID} is deleted successfully`;
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const GetForm = async (req, res, next) => {
    try {
        const { FormID } = req.params

        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
        const FormExists = await Form.findOne({ FormID }).select(whatIDontWant);

        if (!FormExists) {
            return next(new AppError("No Form is associated with this FormID", 400))
        }

        let response = FormExists;
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const GetSpecificDataForm = async (req, res, next) => {
    try {
        const { FormID, propertyToRetrieve } = req.params;

        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
        const FormExists = await Form.findOne({ FormID }).select(whatIDontWant);

        if (!FormExists) {
            return next(new AppError("No Form is associated with this FormID", 400))
        }

        const propertyAllowedToRetrieve = (() => {
            let toRemove = whatIDontWant.split(" ")
            toRemove = toRemove.map(prop => prop.slice(1, prop.length))

            let arr = new Array();
            let allAvailable = Object.keys(Form.schema.obj)

            for (let x of allAvailable) {
                if (!toRemove.includes(x)) {
                    arr.push(x)
                }
            }
            return arr
        })()

        if (!FormExists[propertyToRetrieve] || !propertyAllowedToRetrieve.includes(propertyToRetrieve)) {
            return next(new AppError("No value found"))
        }

        let response = FormExists[propertyToRetrieve];
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

export const paginationForms = async (req, res, next) => {

    try {
        let { limit, pageNo, order } = req.params;
        limit = Number(limit);
        pageNo = Number(pageNo);

        const totalForms = await Form.countDocuments();
        const whatIDontWant = ["-__v", "-createdAt", "-updatedAt"].join(" ")

        if (!isNaN(limit) && !isNaN(pageNo) && limit > 0 && pageNo > 0) {

            if (!["desc", null, "asce"].includes(order)) {
                return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
            }

            order = ["desc", null, "asce"].indexOf(order) - 1




            let rem = totalForms % limit;
            let div = (totalForms - rem) / limit

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
            const response = await Form.find().select(whatIDontWant).limit(limit).skip(limit * (pageNo - 1)).sort({ FormID: order });

            res.status(201).json({
                status: true,
                res_type: typeof response,
                total_records: totalForms,
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

export const AllpaginationForms = async (req, res, next) => {
    try {
        const { limit } = req.params;

        let { order } = req.params

        if (!["desc", null, "asce"].includes(order)) {
            return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
        }

        order = ["desc", null, "asce"].indexOf(order) - 1


        const totalForms = await Form.countDocuments();
        const whatIDontWant = ["-__v", "-createdAt", "-updatedAt"].join(" ")

        if (limit == process.env.allFormsKeyword) {

            let response = await Form.find().select(whatIDontWant).sort({ FormID: order });
            res.status(201).json({
                status: true,
                res_type: typeof response,
                total_records: totalForms,
                response: response
            })
        }
        else {
            return next(new AppError(`use \`${process.env.allFormsKeyword}\` at the place of limit to get all records.`, 400))
        }
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}
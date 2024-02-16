import QRCode from "qrcode"
import AppError from "../../UTILITY/errClass.js"
import "../../environment.js"
import isURL from "is-url"
import { QR } from "../../SCHEMA/QRSchema.js"

export const sendQRdata = async (req, res, next) => {
    try {
        const { generate } = req.query || null;

        if (!generate) {
            return next(new AppError(`Please provide the 'generate' parameter in the query`))
        }
        if (generate.length > process.env.max_param_limit) {
            return next(new AppError(`Maximum permissible limit of params is ${process.env.max_param_limit}`))
        }


        let gen8;

        if (!isURL(gen8)) {
            gen8 = decodeURIComponent(generate)
        }
        else {
            gen8 = generate
        }

        const qrDataUri = await QRCode.toDataURL(gen8);
        res.setHeader('Content-Type', 'text/plain');
        res.send(qrDataUri)



    } catch (e) {
        return next(new AppError(e.message))
    }
}

export const downloadQRImage = async (req, res, next) => {
    try {

        const queryParams = new URLSearchParams(req.query);
        const apiUrl = `${process.env.fetch_URL_sendQR}?${queryParams}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            const error = await (await response.json()).response
            return next(new AppError(error))
        }

        let imageData = (await response.text())

        const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

        const binaryData = Buffer.from(base64Data, 'base64');

        //force downlaod
        res.setHeader('Content-Disposition', 'attachment; filename="qr-code.png"');

        // Set the content type header for PNG image
        res.setHeader('Content-Type', 'image/png');
        res.send(binaryData)

    } catch (e) {
        return next(new AppError(e.message))
    }
}


export const viewQRImage = async(req,res,next)=>{
    try {

        const queryParams = new URLSearchParams(req.query);
        const apiUrl = `${process.env.fetch_URL_sendQR}?${queryParams}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            const error = await (await response.json()).response
            return next(new AppError(error))
        }

        let imageData = (await response.text())

        const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

        const binaryData = Buffer.from(base64Data, 'base64');

        // Set the content type header for PNG image
        res.setHeader('Content-Type', 'image/png');
        res.send(binaryData)

    } catch (e) {
        return next(new AppError(e.message))
    }
}


export const CreateQR = async (req, res, next) => {
    try {

        const { QRPurpose, QRContent } = req.body

        // console.log(req.body,!QRContent)
        if (!QRContent || !QRPurpose) {
            return next(new AppError("Content OR Purpose not found"))
        }

        const CreateQR = await QR.create({ QRPurpose, QRContent:QRContent,QRCreatedBy:`${req.admin.adminID}`});


        // let response = createQR
        let response = await QR.findById(CreateQR._id)
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }



}

export const EditQR = async (req, res, next) => {
    try {
        const { QRID } = req.params
        const { QRPurpose,QRContent } = req.body

        req.body = {QRPurpose, QRContent}

        const dateTime = new Date();
        const date = (dateTime.toDateString()).split(" ");
        const LastUpdatedOn = `${date[2]} ${date[1]} ${date[3]}, ${date[0]}`

        const existingQR = await QR.findOneAndUpdate({ QRID }, {
            $set: {...req.body, LastUpdatedOn }
        }, { runValidators: true })
        if (!existingQR) {
            return next(new AppError("No QR Associated with the passed QRID"))
        }

        let response = await QR.findById(existingQR._id)
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}


export const DeleteQR = async (req, res, next) => {
    try {
        const { QRID } = req.params

        const QRExists = await QR.findOneAndDelete({ QRID });

        if (!QRExists) {
            return next(new AppError("No QR is associated with this QRID", 400))
        }

        let response = `QR:${QRID} is deleted successfully`;
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const GetQR = async (req, res, next) => {
    try {
        const { QRID } = req.params

        const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
        const QRExists = await QR.findOne({ QRID }).select(whatIDontWant);

        if (!QRExists) {
            return next(new AppError("No QR is associated with this QRID", 400))
        }

        let response = QRExists;
        res.status(201).json({
            status: true,
            res_type: typeof response,
            response: response
        })
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const GetSpecificDataQR = async(req,res,next) => {
    try{
        const {QRID,propertyToRetrieve} = req.params;

        const whatIDontWant = ["-__v", "-_id" , "-createdAt", "-updatedAt"].join(" ")
        const QRExists = await QR.findOne({ QRID}).select(whatIDontWant);

        if (!QRExists) {
            return next(new AppError("No QR is associated with this QRID", 400))
        }

        const propertyAllowedToRetrieve = (()=>{
            let toRemove = whatIDontWant.split(" ")
            toRemove = toRemove.map(prop => prop.slice(1,prop.length))

            let arr = new Array();
            let allAvailable = Object.keys(QR.schema.obj)

            for (let x of allAvailable){
                if (!toRemove.includes(x)){
                    arr.push(x)
                }
            }
            return arr
        })()

        if (!QRExists[propertyToRetrieve] || !propertyAllowedToRetrieve.includes(propertyToRetrieve)){
            return next(new AppError("No value found"))
        }

        let response = QRExists[propertyToRetrieve];
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

export const paginationQRs = async (req, res, next) => {

    try {
        let { limit, pageNo,order } = req.params;
        limit = Number(limit);
        pageNo = Number(pageNo);

        const totalQRs = await QR.countDocuments();
        const whatIDontWant = ["-__v", "-createdAt", "-updatedAt"].join(" ")

        if (!isNaN(limit) && !isNaN(pageNo) && limit > 0 && pageNo > 0) {

            if (!["desc",null,"asce"].includes(order)){
                return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
            }

            order = ["desc",null,"asce"].indexOf(order) - 1




            let rem = totalQRs % limit;
            let div = (totalQRs - rem) / limit

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
            const response = await QR.find().select(whatIDontWant).limit(limit).skip(limit*(pageNo-1)).sort({QRID : order});

            res.status(201).json({
                status: true,
                res_type: typeof response,
                total_records: totalQRs,
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
 
export const AllpaginationQRs = async (req, res, next) => {
    try {
        const { limit} = req.params;

        let {order} = req.params
        
        if (!["desc",null,"asce"].includes(order)){
            return next(new AppError("Specify the order [asce or desc] to sort the data accordingly"))
        }

        order = ["desc",null,"asce"].indexOf(order) - 1


        const totalQRs = await QR.countDocuments();
        const whatIDontWant = ["-__v", "-createdAt", "-updatedAt"].join(" ")

        if (limit == process.env.allQRsKeyword) {

            let response = await QR.find().select(whatIDontWant).sort({QRID : order});
            res.status(201).json({
                status: true,
                res_type: typeof response,
                total_records: totalQRs,
                response: response
            })
        }
        else {
            return next(new AppError(`use \`${process.env.allQRsKeyword}\` at the place of limit to get all records.`, 400))
        }
    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

export const viewStoredQR = async(req,res,next)=>{
    try {
        let savedQR;
        try {
            const { QRID } = req.params
    
            const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
            const QRExists = await QR.findOne({ QRID }).select(whatIDontWant);
    
            if (!QRExists) {
                return next(new AppError("No QR is associated with this QRID", 400))
            }
    
            savedQR = QRExists;
        } catch (e) {
            return next(new AppError(e.message, 400))
        }

        const queryParams = new URLSearchParams({generate:savedQR.QRContent});
        const apiUrl = `${process.env.fetch_URL_sendQR}?${queryParams}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            const error = await (await response.json()).response
            return next(new AppError(error))
        }

        let imageData = (await response.text())

        const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

        const binaryData = Buffer.from(base64Data, 'base64');

        // Set the content type header for PNG image
        res.setHeader('Content-Type', 'image/png');
        res.send(binaryData)

    } catch (e) {
        return next(new AppError(e.message))
    }
}

export const downloadStoredQR = async(req,res,next)=>{
    try {
        let savedQR;
        try {
            const { QRID } = req.params
    
            const whatIDontWant = ["-__v", "-_id", "-createdAt", "-updatedAt"].join(" ")
            const QRExists = await QR.findOne({ QRID }).select(whatIDontWant);
    
            if (!QRExists) {
                return next(new AppError("No QR is associated with this QRID", 400))
            }
    
            savedQR = QRExists;
        } catch (e) {
            return next(new AppError(e.message, 400))
        }

        const queryParams = new URLSearchParams({generate:savedQR.QRContent});
        const apiUrl = `${process.env.fetch_URL_sendQR}?${queryParams}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            const error = await (await response.json()).response
            return next(new AppError(error))
        }

        let imageData = (await response.text())

        const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

        const binaryData = Buffer.from(base64Data, 'base64');

        //force downlaod
        res.setHeader('Content-Disposition', 'attachment; filename="qr-code.png"');

        // Set the content type header for PNG image
        res.setHeader('Content-Type', 'image/png');
        res.send(binaryData)

    } catch (e) {
        return next(new AppError(e.message))
    }
}
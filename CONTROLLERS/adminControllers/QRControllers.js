import QRCode from "qrcode"
import AppError from "../../UTILITY/errClass.js"
import "../../environment.js"
import isURL from "is-url"

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
        console.log(apiUrl)

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
        console.log(apiUrl)

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
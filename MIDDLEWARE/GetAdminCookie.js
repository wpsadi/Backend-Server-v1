import AppError from "../UTILITY/errClass.js"
import JWT from "jsonwebtoken"
import "../environment.js"

export const RetrieveAdminCookie = async(req,res,next)=>{
    // return next(new AppError("error kya hai",400))
    try{
        const {AdminToken} = req.cookies || null;
        // console.log(req)
        
        if (!AdminToken){
            return next(new AppError("Please Login First, thne access this page",401))
        }

        const payload = JWT.verify(AdminToken,process.env.JWT_secret)

        if (!payload){
            return next(new AppError("Invalid Token bogeyman",401))
        }

        let response = {sessionID : payload.sessionID}

        req.admin = response;

        next();


    }
    catch(e){
        return next(new AppError(e.message,400))
    }
}
import AppError from "../UTILITY/errClass.js";

let MassRequestIP = new Object();

export const limit_API_calls = async(req,res,next)=>{
    const ip = req.clientIp
    if (Object.keys(MassRequestIP).includes(ip)){
        MassRequestIP[ip]++;
    }
    else{
        MassRequestIP[`${ip}`] = 0
        setTimeout(()=>{
            delete MassRequestIP[`${ip}`]
        },1000)

    }

    if (MassRequestIP[`${ip}`]>10){
        return next(new AppError("Restricted By API Rate limit -[ 10 Request/sec]"));
    }

    next();


} 


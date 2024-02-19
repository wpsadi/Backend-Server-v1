import AppError from "../UTILITY/errClass.js";

let MassRequestIP = new Object();
let Hr3Ban = new Array()
let indexHr3Ban = 0
export const limit_API_calls = async(req,res,next)=>{
    const ip = req.clientIp

    if (Hr3Ban.includes(ip) && (ip != "::1")){
        return next(new AppError("This IP has a banned for any response for 1hr due excessive API calls ",429));
    }


    if (Object.keys(MassRequestIP).includes(ip)){
        MassRequestIP[ip]++;
    }
    else{
        MassRequestIP[`${ip}`] = 0
        setTimeout(()=>{
            delete MassRequestIP[`${ip}`]
        },1000)

    }

    if ((MassRequestIP[`${ip}`]>10) && (ip != "::1")){
        if (MassRequestIP[`${ip}`]>18){
            Hr3Ban[indexHr3Ban++] = `${ip}`
            setTimeout(()=>{
                delete Hr3Ban[indexHr3Ban-1]
            },1000*60*60)
        }
        
        return next(new AppError("Restricted By API Rate limit -[ 10 Request/sec]",429));
    }

    next();


} 


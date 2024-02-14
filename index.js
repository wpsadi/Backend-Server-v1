import express from "express";
import morgan from "morgan";
import adminRoutes from "./ROUTES/adminRoutes.js"
import { useMiddlewareError } from "./MIDDLEWARE/err.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { IP } from "./MIDDLEWARE/IP.js";
import { RateAPI } from "./API-calling-rate-limit/check-rate-limit.js";

const app = express();
//Important Middleware {different from those middlewares the I made }
app.use(morgan("dev"))
app.use(cookieParser())
app.use(cors({origin:"*",credentials:true}))
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(IP,RateAPI)

// Routes \
    // go to /ROUTES to see different methods and routes avilable at admin
app.use("/api/v1/admin",adminRoutes)


// Route to keep server alive
app.use("/keepMeAlive",(req,res)=>{
    res.status(200).send("Ok")
})

//Any Invalid Route
app.use("*",(req,res)=>{
    let response = "Invalid Route" 


    res.status(400).json({
        success:false,
        res_type:typeof response,
        response:response
    })
})

//In case Any Route Raises Error, this will be used to send the error
app.use(useMiddlewareError)




export default app;


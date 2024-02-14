import { Schema,model } from "mongoose";

const IP_API_call_schema = new Schema({
    ip:{
        type:String,
        required:true,
        unique:[true,"It is creating multiple entries"],
        expireAfterSeconds:1,
    },
    NoOfRequests:{
        type:Number,
        default:0
    },
    createdAt: { type: Date, expires: '60s', default: Date.now }
}) 


const API_limit = model("API_Calls",IP_API_call_schema)

 
export default API_limit
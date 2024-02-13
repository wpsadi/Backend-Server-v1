// to prevent the abuse of sending unsolicited emails in Admin Login

import { Schema,model } from "mongoose";

const adminLoginLimitIP = new Schema({
    ip:{
        type:String,
        required:true
    },
    adminLoginRequests:[{
            EmailID:String,
            EmailVerify:{
                type:Number,
                default:0
            },
            LoginAuthMail:{
                type:Number,
                default:0,
            }
    }],
    createdAt:{type:Date,default:Date.now},
    expiresAt:{type:Date,expires:0}
})

// adminLoginLimitIP.pre('save',function(next){
//     if (!this.isModified("createdAt")){
//         next()
//     }

//     this.expiresAt = new Date(Date.now() + (3* 60 * 60 * 1000))
// })


const adminIPLog = model("Admin_IP_logins",adminLoginLimitIP)

adminIPLog.collection.createIndex({expiresAt:1},{expireAfterSeconds:0})

export default adminIPLog;

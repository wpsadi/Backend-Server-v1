// this will generate ids that will be send to the respective emails to regenrate the password

//How this will work,

/*this will create an entry in mongoDB and 
a link will be send to the email address,
although that link doesn't exist, there will be a form
in which Admin will fill that link 
and the New Password after which the password will be updated*/

import { Schema,model } from "mongoose";
import "../environment.js"
import JWT from "jsonwebtoken"

const FrgtPassSchema = new Schema({
    adminID:{
        type:String,
        required:[true,"adminID was not passed during creation of Reset Token"]
    },
    AdminEmail:String,
    createdAt:{type:Date,default:Date.now},
    expiresAt:{type:Date,expires:0} 

})

// This link should expire every 15 minutes

const FrgtPassModel = model("Admin_Forget_Password",FrgtPassSchema)

FrgtPassModel.collection.createIndex({expiresAt:1},{expireAfterSeconds:0})

export default FrgtPassModel
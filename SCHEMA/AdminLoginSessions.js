import { Schema,model } from "mongoose";
import "../environment.js"
import JWT from "jsonwebtoken"

const AdminSessionSchema = new Schema({
    adminID:{type:String,required:[true,"AdminID is needed to created to create a session"]},
    Approved:{type:Boolean,default:false},
    Revoked:{type:Boolean,default:false},
    createdAt:{type:Date,default:Date.now},
    expiresAt:{type:Date,expires:0},
    verificationMailSentCount:{type:Number,default:0}
})

// AdminSessionSchema.pre('save',function(next){
//     if (!this.isModified("createdAt")){
//         next()
//     }

//     this.expiresAt = new Date(Date.now() + (12* 60 * 60 * 1000))
// })


AdminSessionSchema.methods = {
    genJWT() {
        // console.log(this.id)
        // console.log(JWT.sign({ sessionID: this.id }, process.env.JWT_secret, { expiresIn: "12h" }))

        return JWT.sign({ sessionID: this.id }, process.env.JWT_secret, { expiresIn: "12h" })
    }
}

const AdminSessionModel = model("Admin_login_sessions",AdminSessionSchema) 
AdminSessionModel.collection.createIndex({expiresAt:1},{expireAfterSeconds:0})

export default AdminSessionModel

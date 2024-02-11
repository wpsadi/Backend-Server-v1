import { Schema,model } from "mongoose"
import bcrypt from "bcrypt"

const updateAdmin = new Schema({
    AdminEmail:{
        type:String,
    },
    password:String,
    AdminName:String,
    UpdateIn:{
        type:String,
        unique:[true,"The server is creating a new entry for these changes but already an entry exists. Wait 2 hours to retry and also please report this significant error to the Admins of this server"]
    },
    createdAt:{type:Date,default:Date.now},
    expiresAt:{type:Date,expires:0}
})

updateAdmin.pre("save", async function(next){
    if (!this.isModified("password")) {
        next()
    }

    this.password = await bcrypt.hash(this.password,10)
})


const updatesInAdmin = model("Update_In_Admin",updateAdmin)

updatesInAdmin.collection.createIndex({expiresAt:1},{expireAfterSeconds:0})


export default updatesInAdmin;
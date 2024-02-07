import { Schema, model } from "mongoose";
import JWT from "jsonwebtoken"
import "../environment.js"
import bcrypt from "bcrypt"

const AdminSchema = new Schema({
    AdminName: {
        type: String,
        lowercase: true,
        trim: true,
        required: [true, "Name is not Found in parameters"],
        minLength: [5, "Name should be 5 character Long atleast"],
        maxLength: [64, "Name can't exceed 64 characters"]
    },
    password: {
        type: String,
        trim: true,
        required: [true, "Password is not Found in parameters"],
        minLength: [8, "Password should be 8 character Long atleast"],
        maxLength: [128, "Password can't exceed 128 characters"],
        select: false
    },
    VerifiedBy: {
        lowercase: true,
        type: String,
        trim: true,
        required: [true, "We Couldn't get the info about who is creating these credentials"],
        minLength: [5, "Name should be 5 character Long atleast"],
        maxLength: [64, "Name can't exceed 64 characters"]
    },
    AdminEmail: {
        unique:[true,"Account already Created with the given Email ID"],
        lowercase: true,
        type: String,
        trim: true,
        required: [true, "Please provide your email"]
    }
}, {
    timestamps: true
})

AdminSchema.pre("save", async function(next){
    if (!this.isModified("password")) {
        next()
    }

    this.password = await bcrypt.hash(this.password,10)
})


AdminSchema.methods = {
    genJWT() {
        return JWT.sign({ adminID: this.id }, process.env.JWT_secret, { expiresIn: "7d" })
    },
    comparePass(password){
        return bcrypt.compare(password,this.password)
    }
}

export const Admin = model("Admins", AdminSchema);
import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import autoIncrement from "mongoose-sequence"
import "../environment.js"

const autoInc = autoIncrement(mongoose)

const FormSchema = new Schema({
    FormPurpose: {
        type: String,
        default: process.env.default_BlogTitle,
        trim: true,
        required: [true, "Purpose of Form is missing"]
    },
    FormCreatedBy: {
        type: String
    },
    URLToForm: {
        type: String,
        minLength: 5,
        // maxLength:[process.env.max_param_limit,`Maximum Permissible Length is ${process.env.max_param_limit}`],
        required: [true, "Link of Form is missing"]
    },
    FormID: {
        type: Number,
        unique: true
    },
    CreatedOn: { // value set by pre('save')
        type: String
    },
    LastUpdatedOn: { // value set by pre('save')
        type: String
    }

}, { timestamps: true })

FormSchema.plugin(autoInc, { inc_field: "FormID" })

FormSchema.pre('save', async function (next) {
    // console.log(this)
    if (!this.isModified('updatedAt')) {
        next();
       
    }

    const dateTime = new Date();
    const date = (dateTime.toDateString()).split(" ");

    if (!this.CreatedOn) {
        this.CreatedOn = `${date[2]} ${date[1]} ${date[3]}, ${date[0]}`
    }
    this.LastUpdatedOn = `${date[2]} ${date[1]} ${date[3]}, ${date[0]}`;

})



export const Form = model("Forms",FormSchema)
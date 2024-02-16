import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import autoIncrement from "mongoose-sequence"
import "../environment.js"

const autoInc = autoIncrement(mongoose)

const QRSchema = new Schema({
    QRPurpose: {
        type: String,
        default: process.env.default_BlogTitle,
        trim: true,
        required: [true, "Title of QR is missing"]
    },
    QRCreatedBy: {
        type: String
    },
    QRContent: {
        type: String,
        minLength: 5,
        maxLength:[process.env.max_param_limit,`Maximum Permissible Length is ${process.env.max_param_limit}`],
        required: [true, "Content of QR is missing"]
    },
    QRID: {
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

QRSchema.plugin(autoInc, { inc_field: "QRID" })

QRSchema.pre('save', async function (next) {
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



export const QR = model("QR",QRSchema)
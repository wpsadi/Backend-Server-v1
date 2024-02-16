import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import autoIncrement from "mongoose-sequence"
import "../environment.js"

const autoInc = autoIncrement(mongoose)

const AnnouncementSchema = new Schema({
    AnnouncementTitle: {
        type: String,
        default: process.env.default_BlogTitle,
        trim: true,
        required: [true, "Title of Announcement is missing"]
    },
    AnnouncementCreatedBy: {
        type: String
    },
    AnnouncementContent: {
        type: String,
        minLength: 5,
        required: [true, "Content of Announcement is missing"]
    },
    AnnouncementID: {
        type: Number,
        unique: true
    },
    AnnouncementImage: {
        public_id: {
            type: String,
            default: process.env.default_AnnouncementImage_public_id
        },
        secure_url: {
            type: String,
            default: process.env.default_AnnouncementImage_secure_url
        },
        rawgit_url: {
            type: String,
            default: process.env.default_AnnouncementImage_rawgit_url
        }
    },
    CreatedOn: { // value set by pre('save')
        type: String
    },
    LastUpdatedOn: { // value set by pre('save')
        type: String
    }

}, { timestamps: true })

AnnouncementSchema.plugin(autoInc, { inc_field: "AnnouncementID" })

AnnouncementSchema.pre('save', async function (next) {
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



export const Announcement = model("announcement",AnnouncementSchema)
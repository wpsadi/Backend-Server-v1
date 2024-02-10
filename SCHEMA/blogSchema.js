import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import autoIncrement from "mongoose-sequence"
import "../environment.js"

const autoInc = autoIncrement(mongoose)

const blogSchema = new Schema({
    BlogTitle: {
        type: String,
        default: process.env.default_BlogTitle,
        trim: true,
    },
    BlogAuthor: {
        type: String,
        default: process.env.default_BlogAuthor,
        trim: true,
    },
    BlogAuthorEmail: {
        type: String
    },
    BlogContent: {
        type: String,
        minLength: 5,
        required: [true, "Content of blog is missing"]
    },
    BlogCategory: { 
        type: Array,
        trim:true
        // set: values => values.map(value => value.trim()) 
    },
    BlogID: {
        type: Number,
        unique: true
    },
    BlogImage: {
        public_id: {
            type: String,
            default: process.env.default_BlogImage_public_id
        },
        secure_url: {
            type: String,
            default: process.env.default_BlogImage_secure_url
        },
        rawgit_url: {
            type: String,
            default: process.env.default_BlogImage_rawgit_url
        }
    },
    CreatedOn: { // value set by pre('save')
        type: String
    },
    FirstPublishedOn: {
        type: String,
        default: process.env.default_FirstPublishedOn
    },
    Published:{
        type:Boolean,
        default:false
    },
    LastUpdatedOn: { // value set by pre('save')
        type: String
    },
    Approved: {
        type: Boolean,
        default: false,
        select: false
    },
    ApprovedBy: {
        type: String,
        default: "None"
    }
    // statusChanges:{
    //     type:Boolean,
    //     enum:[true,false],
    //     default:false

    // }

}, { timestamps: true })

blogSchema.plugin(autoInc, { inc_field: "BlogID" })
blogSchema.pre('save', async function (next) {
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



export const Blog = model("blogs", blogSchema)
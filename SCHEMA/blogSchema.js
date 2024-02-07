import { Schema,model } from "mongoose";
import mongoose from "mongoose";
import autoIncrement from "mongoose-sequence"

const autoInc = autoIncrement(mongoose)

const blogSchema = new Schema({
    BlogTitle:{
        type:String,
        default:"Unknown",
        trim:true,
    },
    BlogAuthor:{
        type:String,
        default:"Anonymous",
        trim:true,
    },
    BlogAuthorEmail:{
        type:String
    },
    BlogContent:{
        type:String,
        minLength:5,
        required:[true,"Content of blog is missing"]
    },
    BlogCategory:[{type:String}],
    BlogID:{
        type:Number,
        unique:true
    },
    BlogImage:{
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        },
        rawgit_url:{
            type:String
        }
    },
    CreatedOn:{
        type:String
    },
    FirstPublishedOn:{
        type:String
    },
    LastUpdatedOn:{
        type:String
    },
    Approved:{
        type:Boolean,
        default:false,
        select:false
    },
    ApprovedBy:{
        type:String,
        default:"None"
    }

},{timestamps:true})

blogSchema.plugin(autoInc,{inc_field:"BlogID"})
blogSchema.pre('save',async function (next){
    if (!this.isModified('CreatedOn')){
        next()
    }
    const dateTime = new Date();
    const date = (dateTime.toDateString()).split(" ")
    this.CreatedOn = `${date[2]} ${date[1]} ${date[3]}, ${date[0]}`
    this.LastUpdatedOn = `${date[2]} ${date[1]} ${date[3]}, ${date[0]}`

})

export const Blog = model("blogs",blogSchema)
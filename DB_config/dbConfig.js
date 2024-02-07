import {connect} from "mongoose"
import "../environment.js"

const MongoDB_URL = process.env.MongoDB_URL;

export const dbConnect = async()=>{
    const conn = await connect(MongoDB_URL)
    if (conn){
        console.log(`Connected to a MongoDB Cluster at ${conn.connection.host}`)
    }
    else{
        console.log(`Error in connecting to Mongo Cluster`)
    }
} 
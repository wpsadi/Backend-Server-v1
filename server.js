import app from "./index.js";
import "./environment.js";// this declare the .env file to use
import { dbConnect } from "./DB_config/dbConfig.js";
import cloudinary from "cloudinary";
import test from "./ShellCommands.js"
import { stayAfloatAPI } from "./forRender.js";


cloudinary.config({ 
    cloud_name: process.env.cloud_name, 
    api_key: process.env.api_key, 
    api_secret: process.env.api_secret 
  });


const PORT = process.env.PORT
app.listen(PORT,async ()=>{
    await dbConnect();
    // stayAfloatAPI() // This will keep the server alive
    // test()
    console.log(`Server is running at PORT -> ${PORT}\n`)
})


import app from "./index.js";
import "./environment.js";// this declare the .env file to use
import { dbConnect } from "./DB_config/dbConfig.js";




const PORT = process.env.PORT
app.listen(PORT,async ()=>{
    await dbConnect();
    console.log(`Server is running at PORT -> ${PORT}\n`)
})


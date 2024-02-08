import { Router } from "express";
import { pong, sendConfirmationOfAdmin, createNewAdmin, Admin_Login,CreateBlog,EditBlog } from "../CONTROLLERS/adminController.js"
import { CheckAdmin } from "../MIDDLEWARE/isAdmin.js";
import upload from "../MIDDLEWARE/multer.middleware.js";
import { RetrieveAdminCookie } from "../MIDDLEWARE/GetAdminCookie.js";

const r = Router();
// Definition of all functions is in /CONTROLLERS

r.use("/ping", pong)

r.route("/autoLogin").get(RetrieveAdminCookie, CheckAdmin, sendConfirmationOfAdmin)

r.route("/NewAdmin").post(RetrieveAdminCookie, CheckAdmin, createNewAdmin)
//For creating a Prime Account{1st Admin}
// r.route("/NewAdmin").post(createNewAdmin)

r.route("/login").post(Admin_Login)

 

//Blogs
r.route("/blogs")
    .post(RetrieveAdminCookie, CheckAdmin,upload("blogs").single("coverPage"),CreateBlog)
r.route("/blogs/:BlogID").put(RetrieveAdminCookie, CheckAdmin,upload("blogs").single("coverPage"),EditBlog)
export default r;
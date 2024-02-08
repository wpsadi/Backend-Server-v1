import { Router } from "express";
import { pong, sendConfirmationOfAdmin, createNewAdmin, Admin_Login } from "../CONTROLLERS/adminControllers/adminAuthController.js"
import { CreateBlog, DeleteBlog, EditBlog, GetBlog, PublishBlog, UnpublishBlog, approveBlog, rejectBlog } from "../CONTROLLERS/adminControllers/BlogControllers.js"
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
    .post(RetrieveAdminCookie, CheckAdmin, upload("blogs").single("coverPage"), CreateBlog)

r.route("/blogs/:BlogID")
    .put(RetrieveAdminCookie, CheckAdmin, upload("blogs").single("coverPage"), EditBlog)
    .delete(RetrieveAdminCookie, CheckAdmin, DeleteBlog)
    .get(RetrieveAdminCookie, CheckAdmin, GetBlog)

r.route("/blogs/:BlogID/approve").get(RetrieveAdminCookie, CheckAdmin, approveBlog)

r.route("/blogs/:BlogID/reject").get(RetrieveAdminCookie, CheckAdmin, rejectBlog)

r.route("/blogs/:BlogID/publish").get(RetrieveAdminCookie, CheckAdmin, PublishBlog);

r.route("/blogs/:BlogID/unpublish").get(RetrieveAdminCookie, CheckAdmin, UnpublishBlog);

export default r;
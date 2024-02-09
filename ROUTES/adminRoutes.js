import { Router } from "express";
import { pong, sendConfirmationOfAdmin, createNewAdmin, Admin_Login } from "../CONTROLLERS/adminControllers/adminAuthController.js"
import { CreateBlog, DeleteBlog, EditBlog, GetBlog, PublishBlog, UnpublishBlog, approveBlog, paginationBlogs, rejectBlog, AllpaginationBlogs, AllpaginationApprovedBlogs, paginationApprovedBlogs, paginationRejectedBlogs, AllpaginationRejectedBlogs } from "../CONTROLLERS/adminControllers/BlogControllers.js"
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
    .get(GetBlog)

r.route("/blogs/:BlogID/approve").get(RetrieveAdminCookie, CheckAdmin, approveBlog)

r.route("/blogs/:BlogID/reject").get(RetrieveAdminCookie, CheckAdmin, rejectBlog)

r.route("/blogs/:BlogID/publish").get(RetrieveAdminCookie, CheckAdmin, PublishBlog);

r.route("/blogs/:BlogID/unpublish").get(RetrieveAdminCookie, CheckAdmin, UnpublishBlog);

r.route("/blogs/page/:limit/:pageNo/:order").get(paginationBlogs)
r.route("/blogs/page/:limit/:order").get(AllpaginationBlogs)

r.route("/blogs/approved/page/:limit/:pageNo/:order").get(RetrieveAdminCookie, CheckAdmin, paginationApprovedBlogs)
r.route("/blogs/approved/page/:limit/:order").get(RetrieveAdminCookie, CheckAdmin, AllpaginationApprovedBlogs)

r.route("/blogs/rejected/page/:limit/:pageNo/:order").get(RetrieveAdminCookie, CheckAdmin, paginationRejectedBlogs)
r.route("/blogs/rejected/page/:limit/:order").get(RetrieveAdminCookie, CheckAdmin, AllpaginationRejectedBlogs)
export default r;
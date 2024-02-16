import { Router } from "express";
import { pong, sendConfirmationOfAdmin, createNewAdmin, Admin_Login, createPrimeAdmin, SearchAdminFromID, verifyAdminAccount, DismissAdmin, UpdateAdmin, forgeAdminChnges, AllowAdminSession, RevokeAdminSession, getAllAdmins, RevokeFromAdminPanel, RevokeAllExceptCurrentAdminPanel, GetAdminSessions, Admin_Logout, SendForgetPasswordTokenLink, updatePasswordFrgt } from "../CONTROLLERS/adminControllers/adminAuthController.js"
import { CreateBlog, DeleteBlog, EditBlog, GetBlog, PublishBlog, UnpublishBlog, approveBlog, paginationBlogs, rejectBlog, AllpaginationBlogs, AllpaginationApprovedBlogs, paginationApprovedBlogs, paginationRejectedBlogs, AllpaginationRejectedBlogs, paginationPublishedBlogs, AllpaginationPublishedBlogs, AllpaginationUnpublishedBlogs, paginationUnpublishedBlogs, GetSpecificData } from "../CONTROLLERS/adminControllers/BlogControllers.js"
import { CheckAdmin } from "../MIDDLEWARE/isAdmin.js";
import upload from "../MIDDLEWARE/multer.middleware.js";
import { RetrieveAdminCookie } from "../MIDDLEWARE/GetAdminCookie.js";
import { IP } from "../MIDDLEWARE/IP.js";
import { AllpaginationAnnouncements, CreateAnnouncement, DeleteAnnouncement, EditAnnouncement, GetAnnouncement, GetSpecificDataAnnoucement, paginationAnnouncements } from "../CONTROLLERS/adminControllers/AnnouncementControllers.js";

const r = Router();
// Definition of all functions is in /CONTROLLERS

r.use("/ping", pong)

r.route("/autoLogin").get(RetrieveAdminCookie, CheckAdmin, sendConfirmationOfAdmin)

r.route("/NewAdmin").post(RetrieveAdminCookie, CheckAdmin, createNewAdmin)

r.route("/frgt-pass-token").post(SendForgetPasswordTokenLink)

//For creating a Prime Account{1st Admin}
r.route("/PrimeAdmin").post(createPrimeAdmin)

r.route("/login").post(IP, Admin_Login)

r.route("/adminLogout").get(RetrieveAdminCookie, CheckAdmin, Admin_Logout)

r.route("/retrieveAdmin/:passedID").get(RetrieveAdminCookie, CheckAdmin, SearchAdminFromID)

r.route("/verify/changes/:ChngeID").get(forgeAdminChnges)

r.route("/verify/:passedID").get(verifyAdminAccount)

r.route("/delete/:adminID").get(RetrieveAdminCookie, CheckAdmin, DismissAdmin)

r.route("/update").put(RetrieveAdminCookie, CheckAdmin, UpdateAdmin)

// this is a forget password route
r.route("/update/password").post(updatePasswordFrgt)

r.route("/authorize/:passedSessionID").get(AllowAdminSession)
r.route("/reject/:passedSessionID").get(RevokeAdminSession);

// in this route the reponse has array of objects with first one is the Current Logged In Admin
r.route("/allAdmins").get(RetrieveAdminCookie, CheckAdmin, getAllAdmins);

r.route("/AllSessions").get(RetrieveAdminCookie, CheckAdmin, GetAdminSessions)
r.route("/revoke/:sessionID").get(RetrieveAdminCookie, CheckAdmin, RevokeFromAdminPanel)
r.route("/RevokeRestAllSessions").get(RetrieveAdminCookie, CheckAdmin, RevokeAllExceptCurrentAdminPanel)

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

r.route("/blogs/:BlogID/:propertyToRetrieve").get(GetSpecificData)

r.route("/blogs/page/:limit/:pageNo/:order").get(RetrieveAdminCookie, CheckAdmin, paginationBlogs)
r.route("/blogs/page/:limit/:order").get(RetrieveAdminCookie, CheckAdmin, AllpaginationBlogs)

r.route("/blogs/approved/page/:limit/:pageNo/:order").get(RetrieveAdminCookie, CheckAdmin, paginationApprovedBlogs)
r.route("/blogs/approved/page/:limit/:order").get(RetrieveAdminCookie, CheckAdmin, AllpaginationApprovedBlogs)

r.route("/blogs/rejected/page/:limit/:pageNo/:order").get(RetrieveAdminCookie, CheckAdmin, paginationRejectedBlogs)
r.route("/blogs/rejected/page/:limit/:order").get(RetrieveAdminCookie, CheckAdmin, AllpaginationRejectedBlogs)

r.route("/blogs/published/page/:limit/:pageNo/:order").get(paginationPublishedBlogs)
r.route("/blogs/published/page/:limit/:order").get(AllpaginationPublishedBlogs)

r.route("/blogs/unpublished/page/:limit/:pageNo/:order").get(RetrieveAdminCookie, CheckAdmin, paginationUnpublishedBlogs)
r.route("/blogs/unpublished/page/:limit/:order").get(RetrieveAdminCookie, CheckAdmin, AllpaginationUnpublishedBlogs)


// Announcement
r.route("/announcements")
    .post(RetrieveAdminCookie, CheckAdmin, upload("blogs").single("coverPage"), CreateAnnouncement)


r.route("/announcements/:AnnouncementID")
    .put(RetrieveAdminCookie, CheckAdmin, upload("blogs").single("coverPage"), EditAnnouncement)
    .delete(RetrieveAdminCookie, CheckAdmin, DeleteAnnouncement)
    .get(GetAnnouncement)

r.route("/announcements/:AnnouncementID/:propertyToRetrieve").get(GetSpecificDataAnnoucement)

r.route("/announcements/page/:limit/:pageNo/:order").get(paginationAnnouncements)
r.route("/announcements/page/:limit/:order").get(AllpaginationAnnouncements)
export default r;
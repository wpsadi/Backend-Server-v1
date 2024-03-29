import { Router } from "express";
import { pong, sendConfirmationOfAdmin, createNewAdmin, Admin_Login, createPrimeAdmin, SearchAdminFromID, verifyAdminAccount, DismissAdmin, UpdateAdmin, forgeAdminChnges, AllowAdminSession, RevokeAdminSession, getAllAdmins, RevokeFromAdminPanel, RevokeAllExceptCurrentAdminPanel, GetAdminSessions, Admin_Logout, SendForgetPasswordTokenLink, updatePasswordFrgt } from "../CONTROLLERS/adminControllers/adminAuthController.js"
import { CreateBlog, DeleteBlog, EditBlog, GetBlog, PublishBlog, UnpublishBlog, approveBlog, paginationBlogs, rejectBlog, AllpaginationBlogs, AllpaginationApprovedBlogs, paginationApprovedBlogs, paginationRejectedBlogs, AllpaginationRejectedBlogs, paginationPublishedBlogs, AllpaginationPublishedBlogs, AllpaginationUnpublishedBlogs, paginationUnpublishedBlogs, GetSpecificData } from "../CONTROLLERS/adminControllers/BlogControllers.js"
import { CheckAdmin } from "../MIDDLEWARE/isAdmin.js";
import upload from "../MIDDLEWARE/multer.middleware.js";
import { RetrieveAdminCookie } from "../MIDDLEWARE/GetAdminCookie.js";
import { IP } from "../MIDDLEWARE/IP.js";
import { AllpaginationAnnouncements, CreateAnnouncement, DeleteAnnouncement, EditAnnouncement, GetAnnouncement, GetSpecificDataAnnouncement, paginationAnnouncements } from "../CONTROLLERS/adminControllers/AnnouncementControllers.js";
import { AllpaginationQRs, CreateQR, DeleteQR, EditQR, GetQR, GetSpecificDataQR, downloadQRImage, downloadStoredQR, paginationQRs, sendQRdata, viewQRImage, viewStoredQR } from "../CONTROLLERS/adminControllers/QRControllers.js";
import { AllpaginationForms, CreateForm, DeleteForm, EditForm, GetForm, GetSpecificDataForm, SendForm, paginationForms } from "../CONTROLLERS/adminControllers/FormsControllers.js";
import { AllpaginationLinks, CreateLink, DeleteLink, EditLink, GetLink, GetSpecificDataLink, SendLink, paginationLinks } from "../CONTROLLERS/adminControllers/LinkGenControllers.js";

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

r.route("/announcements/:AnnouncementID/:propertyToRetrieve").get(GetSpecificDataAnnouncement)

r.route("/announcements/page/:limit/:pageNo/:order").get(paginationAnnouncements)
r.route("/announcements/page/:limit/:order").get(AllpaginationAnnouncements)


//QR-code
r.route("/qr")
    .get(sendQRdata)
    .post(RetrieveAdminCookie, CheckAdmin, CreateQR)

r.route("/qr/download").get(downloadQRImage)
r.route("/qr/view").get(viewQRImage)



r.route("/qr/:QRID")
    .put(RetrieveAdminCookie, CheckAdmin, upload("blogs").single("coverPage"), EditQR)
    .delete(RetrieveAdminCookie, CheckAdmin, DeleteQR)
    .get(RetrieveAdminCookie, CheckAdmin, GetQR)

r.route("/qr/:QRID/:propertyToRetrieve").get(GetSpecificDataQR)

r.route("/qr/page/:limit/:pageNo/:order").get(RetrieveAdminCookie, CheckAdmin, paginationQRs)
r.route("/qr/page/:limit/:order").get(RetrieveAdminCookie, CheckAdmin, AllpaginationQRs)

r.route("/qr/stored/:QRID/view").get(viewStoredQR)
r.route("/qr/stored/:QRID/download").get(downloadStoredQR)


//Forms
r.route("/go/form/:ID").get(SendForm)
r.route("/form")
    // .get(sendQRdata)
    .post(RetrieveAdminCookie, CheckAdmin, CreateForm)

r.route("/form/:FormID")
    .put(RetrieveAdminCookie, CheckAdmin, upload("blogs").single("coverPage"), EditForm)
    .delete(RetrieveAdminCookie, CheckAdmin, DeleteForm)
    .get(RetrieveAdminCookie, CheckAdmin, GetForm)

r.route("/form/:FormID/:propertyToRetrieve").get(GetSpecificDataForm)

r.route("/form/page/:limit/:pageNo/:order").get(RetrieveAdminCookie, CheckAdmin, paginationForms)
r.route("/form/page/:limit/:order").get(RetrieveAdminCookie, CheckAdmin, AllpaginationForms)




// Links shortner
r.route("/go/link/:ID").get(SendLink)
r.route("/link")
    // .get(sendQRdata)
    .post(RetrieveAdminCookie, CheckAdmin, CreateLink)

r.route("/link/:LinkID")
    .put(RetrieveAdminCookie, CheckAdmin, upload("blogs").single("coverPage"), EditLink)
    .delete(RetrieveAdminCookie, CheckAdmin, DeleteLink)
    .get(RetrieveAdminCookie, CheckAdmin, GetLink)

r.route("/link/:LinkID/:propertyToRetrieve").get(GetSpecificDataLink)

r.route("/link/page/:limit/:pageNo/:order").get(RetrieveAdminCookie, CheckAdmin, paginationLinks)
r.route("/link/page/:limit/:order").get(RetrieveAdminCookie, CheckAdmin, AllpaginationLinks)
export default r;
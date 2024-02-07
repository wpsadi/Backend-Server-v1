import { Admin } from "../SCHEMA/adminSchema.js"
import AppError from "../UTILITY/errClass.js"

export const CheckAdmin = async(req,res,next)=>{
    
    const {adminID} = req.admin
    const AdminExist = await Admin.findById(adminID)

    if (!AdminExist){
        return next(new AppError("You are not authorized to go further"))
    }

    req.adminDetails = AdminExist;

    next();

}
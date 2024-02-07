import emailValidator from "email-validator";

export const emailVal = async(email)=>{
    const result = emailValidator.validate(email)
    return result
}
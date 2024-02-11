import marked from "./Mark_to_html.js"

// temp1 - to send email to give verification access to Admin Panel
export const temp1 = (...args)=>{
    const subject = `Verify Your Account Access with USS-ACM Admin Panel`
    const mail = `
    Dear ${args[0]},

    We hope this message finds you well. We're reaching out to inform you that you've been granted Admin Access to the USS-ACM Admin Panel.
    
    To confirm your access and ensure the security of your account, please follow the link below to complete the verification process:
    
    [*Verification Link*]
    ${args[1]}
    
    This link will direct you to a secure verification page where you can confirm your access with just a few clicks.

    We take the security of our platform and your account very seriously. Rest assured that your information is protected by industry-leading security measures.
    
    Thank you for your cooperation in completing the verification process promptly. Your continued support is greatly appreciated.
    
    Best regards,
     
    USS-ACM Admin Panel Team`

    return [subject,marked(mail)]
}

// console.log(await temp1("susie","http://github"))

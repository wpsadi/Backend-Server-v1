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

export const temp2 = (...args)=>{
    const subject = `Login Attempt on Your Account`;
    const mail=  `Dear ${args[0]},

We hope this message finds you well. 

We recently detected a login attempt on your account that appears to be from an unfamiliar location or device. As part of our ongoing efforts to ensure the security of your account, we wanted to reach out and confirm whether this login attempt was authorized by you.

[*Authorization Link*]
AUTHORIZE: ${args[1]}


DENY: ${args[2]}

If you recently tried to access your account from a new device or location, please disregard this message. However, if you did not initiate this login attempt, we highly recommend taking immediate action to secure your account.

To secure your account:
1. Change your password immediately.
2. Enable two-factor authentication if you haven't already.
3. Review your account activity and settings for any suspicious changes.



If you have any concerns or require assistance, please don't hesitate to contact our support team at [support email or phone number].

Thank you for your attention to this matter.

Best regards,
USS-ACM Admin Panel Team`

return [subject,marked(mail)]
}
// console.log(await temp1("susie","http://github"))

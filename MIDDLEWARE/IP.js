export const IP = (req, res, next) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        const ips = forwardedFor.split(',');
        // The original client IP address is usually the first one in the list
        req.clientIp = ips[0].trim();
    } else {
        // If no X-Forwarded-For header is present, fallback to req.ip
        req.clientIp = req.ip;
    }
    
    // console.log(`Original client IP: ${req.clientIp}`);
    
    next();
}
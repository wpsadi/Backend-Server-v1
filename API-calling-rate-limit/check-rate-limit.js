/* The API rate limit can only be applied in minutes because Mongo has a TTL check after 1 minute
*/

import API_limit from "../SCHEMA/API-Rate-limit.js";
import AppError from "../UTILITY/errClass.js";

export const RateAPI = async (req, res, next) => {
    try {
        const ip = String(req.clientIp);
        let IP_exist = await API_limit.findOneAndUpdate(
            { ip },
            { $inc: { NoOfRequests: 1 } },
            { new: true, upsert: true }
        );
        if (IP_exist.NoOfRequests > 60) {
            return next(new AppError("Restricted By API Rate limit -[ 60 Request/min]"));
        }
        next();
    } catch (e) {
        return next(new AppError(e.message));
    }
}



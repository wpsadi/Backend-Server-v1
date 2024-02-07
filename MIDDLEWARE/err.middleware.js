export const useMiddlewareError = (err,req,res,next)=>{
    // console.log(err)
    err.statusCode = err.statusCode || 400;
    err.message = err.message || "something went wrong"

    res.status(err.statusCode).json({
        success: false,
        res_type:typeof err.message,
        message: err.message
        // stack: err.stack
    })
}
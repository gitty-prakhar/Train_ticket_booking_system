export const errorHandler=(err,req,res,next)=>{
    const statusCode=err.statusCode||500;  //error is initialized with the status code of the error or 500 if no status code is provided
    const message=err.message||"Internal Server Error";  //error is initialized with the message of the error or "Internal Server Error" if no message is provided

    return res.status(statusCode).json({
        success:false,
        statusCode,
        message,
        errors:err.errors||[], //error is initialized with the errors array of the error or an empty array if no errors array is provided
    }); //this sends the error to the client as a json response
}
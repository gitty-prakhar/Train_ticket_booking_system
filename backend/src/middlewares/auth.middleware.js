import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const verifyJWT=asyncHandler(async(req,res,next)=>{
    try{
        const token=req.cookies.accessToken||req.header("Authorization").replace("Bearer ","");
        if(!token){
            throw new ApiError(401,"Unauthorised Request\n");
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user=await User.findById(decodedToken._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token\n");
        }
        req.user=user;
        next();
    }
    catch(error){
        throw new ApiError(401,error?.message||"Invalid Access Token\n");
    }
})

export const verifyRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new ApiError(403, "Access denied. Insufficient permissions.");
        }
        next();
    };
};

export { verifyJWT };
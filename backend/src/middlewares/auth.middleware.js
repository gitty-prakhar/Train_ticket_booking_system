import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const verifyJWT=asyncHandler(async(req,res,next)=>{
    try{
        const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError(401,"Unauthorised Request\n"); //throws an error if no token is found
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET); //verifies the token
        const user=await User.findById(decodedToken._id).select("-password -refreshToken"); //finds the user by the decoded token
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token\n"); //throws an error if the user is not found
        }
        req.user=user; //attaches the user to the request object
        next();
    }
    catch(error){
        throw new ApiError(401,error?.message||"Invalid Access Token\n");
    }
})

const verifyRole=(...roles)=>(req,res,next)=>{
    if(!req.user||!roles.includes(req.user.role)){
        throw new ApiError(403,"Access denied. Insufficient permissions."); //throws an error if the user is not authorized
    }
    next(); //passes the request to the next middleware
};

export{verifyJWT,verifyRole};
import { User } from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { verifyAccessToken } from "../../utils/jwt.service.js";

const verifyToken = asyncHandler(async (req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ","");

        if(!token){
            throw new ApiError(401,"Unauthorized Access");
        }

        const decoded = verifyAccessToken(token);

        if(!decoded){
            throw new ApiError(401,"Invalid Token");
        }

        const user = await User.findById(decoded.id).select("-password -refreshToken");

        if(!user){
            throw new ApiError(404,"User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            
            throw new ApiError(401, "ACCESS_TOKEN_EXPIRED");
        }
        
        throw new ApiError(401, error.message || "Invalid Access Token");
    }
})

export default verifyToken;
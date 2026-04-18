// verifyToken.js
import { User } from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { verifyAccessToken } from "../../utils/jwt.service.js";

const verifyToken = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");
    
    
    
    if (!token) {
      // If refreshToken exists → allow refresh flow
      
      if (req.cookies?.refreshToken) {
        
        throw new ApiError(401, "ACCESS_TOKEN_EXPIRED");

      }
       
      // No refresh token → real logout
      throw new ApiError(401, "UNAUTHORIZED");
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError" || req.cookies?.refreshToken) {
      throw new ApiError(401, "ACCESS_TOKEN_EXPIRED");
    }

    throw new ApiError(401, "UNAUTHORIZED");
  }
});

export default verifyToken;

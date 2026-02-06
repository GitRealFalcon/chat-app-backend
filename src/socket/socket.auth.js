import { verifyAccessToken } from "../utils/jwt.service.js";
import { User } from "../models/user.model.js";


async function socketAuth(socket,next){
    try {
        const token = socket.handshake.auth?.token;

        if(!token){
            return next(new Error("Unauthorized Access"));
        }

        const decoded = verifyAccessToken(token);

        if(!decoded){
            return next(new Error("Invalid Token"));
        }
        const user = await User.findById(decoded._id).select("-password -refreshToken");
        if(!user){
            return next(new Error("User not found"));
        }
        socket.user = user;
        next();
    } catch (error) {
        next(new Error("Invalid or expired token"));
    }
}

export {
    socketAuth
}
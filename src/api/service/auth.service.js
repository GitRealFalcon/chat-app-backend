import { User } from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";

const registerUser = async(email, password, name) => {
    const existingUser = await User.findOne({email});
    if(existingUser){
        throw new ApiError(400,"User already Exists");
    }

    const newUser = new User({email,password,name});
    await newUser.save();
    return newUser;
}

const loginUser = async(email,password)=>{
        const user = await User.findOne({email});
        if(!user){
            throw new ApiError(404,"User not found");
        }

        const isPasswordValid = await user.comparePassword(password);
        if(!isPasswordValid){
            throw new ApiError(401,"Invalid Credentials");
        }
        return user;
}

const logoutUser = async(userId)=>{
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404,"User not found");
    }
    user.refreshToken = null;
    await user.save();
    return;
}

const getCurrentUser = async(userId)=>{
    const user = await User.findById(userId).select("-password -refreshToken");
    if(!user){
        throw new ApiError(404,"User not found");
    }
    return user;
}

export default{
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser
}
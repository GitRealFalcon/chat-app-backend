import asyncHandler from "../../utils/asyncHandler.js"
import authService from "../service/auth.service.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse  from "../../utils/ApiRespose.js";

const register = asyncHandler(async (req,res)=>{
    const {name,email,password} = req.body;
    if(!name || !email || !password){
        throw new ApiError(400, "Name, email and password are required");
    }

    const user = await authService.register(name,email,password);
    res.status(201)
    .json(new ApiResponse(201, "User registered successfully",user));
})

const login = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        throw new ApiError(400, "Email and password are required");
    }

    const user = await authService.login(email,password);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res.status(200)
    .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
    })
    .json(new ApiResponse(200, "Login successful", user));

})

const logout = asyncHandler(async(req,res)=>{
    const userId = req.user._id;
    await authService.logout(userId);
    res.status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(200, "Logout successful"));
})

const Me = asyncHandler(async (req,res)=>{
    const userId = req.user._id;
    const user = await authService.getCurrentUser(userId);
    res.status(200)
    .json(new ApiResponse(200, "Current user retrieved successfully", user));
})

export default {
    register,
    login,
    logout,
    Me
}
import asyncHandler from "../../utils/asyncHandler.js"
import authService from "../service/auth.service.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse  from "../../utils/ApiRespose.js";


const register = asyncHandler(async (req,res)=>{
    const {name,email,password} = req.body;
    if(!name || !email || !password){
        throw new ApiError(400, "Name, email and password are required");
    }

    const user = await authService.registerUser(name,email,password);
    res.status(201)
    .json(new ApiResponse(201, "User registered successfully",user));
})

const login = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        throw new ApiError(400, "Email and password are required");
    }

    const {isValidUser,user} = await authService.loginUser(email,password);

    const accessToken = isValidUser.generateAccessToken();
    const refreshToken = isValidUser.generateRefreshToken();
    isValidUser.refreshToken = refreshToken
    isValidUser.save()


    res.status(200)
    .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    })
    .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
       sameSite: "lax",
    })
    .json(new ApiResponse(200, "Login successful", {user,accessToken}));

})

const logout = asyncHandler(async(req,res)=>{
    const userId = req.user._id;
    await authService.logoutUser(userId);
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

const refreshToken = asyncHandler(async(req,res)=>{
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new ApiError(401, "No refresh Token")
    }

    const accessToken = await authService.createAccessToken(refreshToken)

 res.status(200) .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
       sameSite: "lax",
    }).json({
  success: true
});


})


export default {
    register,
    login,
    logout,
    Me,
    refreshToken
}
import JWT from "jsonwebtoken";

export const verifyAccessToken = (token) => {
  return JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token)=>{
  return JWT.verify(token,process.env.REFRESH_TOKEN_SECRET)
}

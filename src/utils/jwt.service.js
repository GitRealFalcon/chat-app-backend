import JWT from "jsonwebtoken";

export const verifyAccessToken = (token) => {
  return JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

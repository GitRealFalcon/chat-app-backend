// socketAuth.js
import { verifyAccessToken } from "../utils/jwt.service.js";
import { User } from "../models/user.model.js";
import cookie from "cookie";

async function socketAuth(socket, next) {
  try {
    const rawCookies = socket.handshake.headers.cookie;

    if (!rawCookies) {
      return next(new Error("UNAUTHORIZED"));
    }

    const { accessToken } = cookie.parse(rawCookies);

    if (!accessToken) {
      return next(new Error("UNAUTHORIZED"));
    }

    const decoded = verifyAccessToken(accessToken);

    const user = await User.findById(decoded.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return next(new Error("UNAUTHORIZED"));
    }

    socket.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new Error("ACCESS_TOKEN_EXPIRED"));
    }

    return next(new Error("UNAUTHORIZED"));
  }
}

export { socketAuth };
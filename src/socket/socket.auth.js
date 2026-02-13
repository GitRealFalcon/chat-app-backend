import { verifyAccessToken } from "../utils/jwt.service.js";
import { User } from "../models/user.model.js";
import cookie from "cookie";

async function socketAuth(socket, next) {
  try {
    const rawCookies = socket.handshake.headers.cookie;

    if (!rawCookies) {
      return next(new Error("Cookie not found"));
    }

    const parsedCookies = cookie.parse(rawCookies);

    const accessToken = parsedCookies.accessToken;

    if (!accessToken) {
      return next(new Error("Unauthorized"));
    }

    const decoded = verifyAccessToken(accessToken);

    if (!decoded) {
      return next(new Error("Invalid Token"));
    }

    const user = await User.findById(decoded.id).select(
      "-password -refreshToken",
    );
    if (!user) {
      return next(new Error("User not found"));
    }
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
}

export { socketAuth };

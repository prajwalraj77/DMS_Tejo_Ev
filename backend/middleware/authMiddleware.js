
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");

      return res.status(500).json({
        message: "Server configuration error",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.sub).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User account not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    // Check whether this is the user's latest login session.
    if (
      !decoded.sessionId ||
      !user.sessionId ||
      decoded.sessionId !== user.sessionId
    ) {
      return res.status(401).json({
        message: "Your session has expired because your account was logged in on another device. Please log in again.",
        code: "SESSION_REPLACED",
      });
    }

    // Check whether the password has been reset since this token was issued.
    if (
      (decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)
    ) {
      return res.status(401).json({
        message: "Your session is no longer valid. Please log in again.",
        code: "TOKEN_VERSION_MISMATCH",
      });
    }

    req.user = user;

    next();

  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    console.error("Authentication error:", error.message);

    return res.status(500).json({
      message: "Authentication failed",
    });
  }
};

export default authMiddleware;

import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import mongoose from "mongoose";
import { randomUUID } from "crypto";

const Router = express.Router();

const ALLOWED_PERMISSIONS = [
  "vehicles.view",
  "vehicles.create",
  "vehicles.edit",
  "vehicles.delete",
  "inventory.view",
  "inventory.create",
  "inventory.edit",
  "inventory.delete",
  "stockInwards.approve",
  "stockInwards.view",
  "stockInwards.create",
  "stockInwards.edit",
  "stockInwards.delete",
  "employees.view",
  "employees.create",
  "employees.edit",
  "employees.delete",
  "billing.view",
  "billing.create",
  "billing.edit",
  "billing.delete",
];

Router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password, and role are required",
      });
    }

    const allowedRoles = [
      "ADMIN",
      "DEALER",
      "SUB_DEALER",
      "SALES_EXECUTIVE",
      "HR",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid user role",
      });
    }

    // Admin can create any allowed role.
    if (req.user.role === "ADMIN") {
      // Dealer and Sub-Dealer business accounts must use
      // their dedicated creation APIs.
      if (role === "DEALER" || role === "SUB_DEALER") {
        return res.status(400).json({
          message:
            "Use the dedicated Dealer or Sub-Dealer API to create this account",
        });
      }
    } else if (req.user.role === "DEALER") {
      // Dealer can create only Sales Executives.
      if (role !== "SALES_EXECUTIVE") {
        return res.status(403).json({
          message: "Dealers can create only Sales Executives",
        });
      }
    } else {
      return res.status(403).json({
        message: "You do not have permission to create users",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    const userData = {
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
    };

    // Never trust a Dealer ID supplied by the client.
    if (req.user.role === "DEALER") {
      if (!req.user.dealerId) {
        return res.status(403).json({
          message: "Your account is not linked to a Dealer",
        });
      }

      userData.dealerId = req.user.dealerId;
    }

    const newUser = await User.create(userData);

    const safeUser = await User.findById(newUser._id).select(
      "-password -sessionId",
    );

    return res.status(201).json({
      message: "User created successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("Failed to create user:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create user",
    });
  }
});

Router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");

      return res.status(500).json({
        message: "Server configuration error",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    // Generate a unique session ID for this login.
    const sessionId = randomUUID();

    // Get the Socket.IO instance.
    const io = req.app.get("io");

    // Notify all previous sessions before replacing the session.
    if (user.sessionId && io) {
      io.to(`user:${user._id.toString()}`).emit("session:replaced", {
        message:
          "Your account has been logged in on another device. For security reasons, this session has been logged out. Please log in again to continue.",
      });
    }

    // Store the new active session.
    user.sessionId = sessionId;

    await user.save();

    // Generate JWT with session and token version.
    const token = jwt.sign(
      {
        role: user.role,
        sessionId: sessionId,
        tokenVersion: user.tokenVersion ?? 0,
      },
      process.env.JWT_SECRET,
      {
        subject: user._id.toString(),
        expiresIn: "8h",
      },
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dealerId: user.dealerId,
        branchId: user.branchId,
        subDealerId: user.subDealerId,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Login failed due to a server error",
    });
  }
});

// ADMIN ONLY: Edit user details
Router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      if (name === undefined && email === undefined) {
        return res.status(400).json({
          message: "Please provide name or email to update",
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Validate and update name.
      if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
          return res.status(400).json({
            message: "Valid user name is required",
          });
        }

        user.name = name.trim();
      }

      // Validate and update email.
      if (email !== undefined) {
        if (typeof email !== "string" || !email.trim()) {
          return res.status(400).json({
            message: "Valid email address is required",
          });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: id },
        });

        if (existingUser) {
          return res.status(409).json({
            message: "This email is already registered to another user",
          });
        }

        user.email = normalizedEmail;
      }

      await user.save();

      const safeUser = await User.findById(id).select("-password -sessionId");

      return res.status(200).json({
        message: "User details updated successfully",
        user: safeUser,
      });
    } catch (error) {
      console.error("Failed to update user:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          message: "This email is already registered",
        });
      }

      return res.status(500).json({
        message: "Failed to update user details",
      });
    }
  },
);

// ADMIN ONLY: Activate or deactivate a user
Router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          message: "isActive must be true or false",
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Prevent an Admin from accidentally disabling their own account.
      if (
        user._id.toString() === req.user._id.toString() &&
        isActive === false
      ) {
        return res.status(400).json({
          message: "You cannot deactivate your own account",
        });
      }

      user.isActive = isActive;

      // Invalidate the existing login session when deactivated.
      if (isActive === false) {
        user.sessionId = null;
        user.tokenVersion = (user.tokenVersion || 0) + 1;
      }

      await user.save();

      const safeUser = await User.findById(id).select("-password -sessionId");

      // Notify existing browser sessions immediately.
      if (isActive === false) {
        const io = req.app.get("io");

        if (io) {
          io.to(`user:${id}`).emit("account:deactivated", {
            message:
              "Your account has been deactivated by an administrator. Please contact your administrator.",
          });
        }
      }

      return res.status(200).json({
        message: isActive
          ? "User account activated successfully"
          : "User account deactivated successfully",
        user: safeUser,
      });
    } catch (error) {
      console.error("Failed to update user status:", error);

      return res.status(500).json({
        message: "Failed to update user status",
      });
    }
  },
);

Router.patch(
  "/:id/permissions",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { permissions } = req.body;

      // Validate the user ID.
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      // Permissions must be an array of strings.
      if (
        !Array.isArray(permissions) ||
        !permissions.every((permission) => typeof permission === "string")
      ) {
        return res.status(400).json({
          message: "Permissions must be an array of strings",
        });
      }

      // Prevent duplicate permissions.

      const uniquePermissions = [...new Set(permissions)];

      const invalidPermissions = uniquePermissions.filter(
        (permission) => !ALLOWED_PERMISSIONS.includes(permission),
      );

      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          message: "One or more permissions are invalid",
          invalidPermissions,
        });
      }

      // Find the target user.
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Replace the user's permissions.
      user.permissions = uniquePermissions;
      await user.save();

      const safeUser = await User.findById(id).select("-password -sessionId");

      return res.status(200).json({
        message: "User permissions updated successfully",
        user: safeUser,
      });
    } catch (error) {
      console.error("Failed to update user permissions:", error);

      return res.status(500).json({
        message: "Failed to update user permissions",
      });
    }
  },
);

Router.get("/", authMiddleware, authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -sessionId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Users retrieved successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);

    return res.status(500).json({
      message: "Failed to fetch users",
    });
  }
});

// ADMIN ONLY: Reset a user's password
Router.patch(
  "/:id/reset-password",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      if (typeof newPassword !== "string" || newPassword.length < 8) {
        return res.status(400).json({
          message: "Password must contain at least 8 characters",
        });
      }

      const user = await User.findById(id).select("+password");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Assign the new password.
      // User model pre-save middleware will hash it using bcrypt.
      user.password = newPassword;

      // Invalidate all previously issued JWT tokens.
      user.tokenVersion = (user.tokenVersion || 0) + 1;

      // Invalidate the currently active login session.
      user.sessionId = null;

      await user.save();

      // Notify the user's existing browser sessions.
      const io = req.app.get("io");

      if (io) {
        io.to(`user:${id}`).emit("session:replaced", {
          message:
            "Your password has been reset by an administrator. Please log in again using your new password.",
        });
      }

      return res.status(200).json({
        message:
          "User password reset successfully. All existing sessions have been invalidated.",
      });
    } catch (error) {
      console.error("Failed to reset user password:", error);

      return res.status(500).json({
        message: "Failed to reset user password",
      });
    }
  },
);

export default Router;

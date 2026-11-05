import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = "admin@tejoev.com";
    const password = "Admin@12345";

    const existingAdmin = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingAdmin) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    const admin = await User.create({
      name: "TEJO EV Admin",
      email: email.toLowerCase(),
      password,
      role: "ADMIN",
      isActive: true,
    });

    console.log("\n================================");
    console.log("ADMIN CREATED SUCCESSFULLY");
    console.log("================================");
    console.log(`Email: ${admin.email}`);
    console.log("Password: Admin@12345");
    console.log(`User ID: ${admin._id}`);
    console.log("================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
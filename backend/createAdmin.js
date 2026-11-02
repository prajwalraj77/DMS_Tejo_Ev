
import "dotenv/config";
import mongoose from "mongoose";

import User from "./models/User.js";

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = "admin@tejoev.com";
    const password = "1234";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("This email already exists. Choose another email.");
      return;
    }

    

    await User.create({
      name: "TEJO Admin",
      email,
      password,
      role: "ADMIN",
      isActive: true,
    });

    console.log("Admin account created successfully.");
    console.log("Email:", email);
    console.log("Password:", password);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();

import express from "express";
import mongoose from "mongoose";
import Dealer from "../models/Dealer.js";
import User from "../models/User.js";
import Counter from "../models/Counter.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";



const Router = express.Router();


Router.post("/", authMiddleware, authorizeRoles("ADMIN"), async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      businessName,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      password,
    } = req.body;

    // Check if email already exists
    const normalizedEmail = email?.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }

    let newDealer;
    let newUser;

    await session.withTransaction(async () => {
      // Generate the next permanent Dealer sequence
      const counter = await Counter.findOneAndUpdate(
        { scope: "DEALER" },
        { $inc: { sequence: 1 } },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          session,
        },
      );

      const dealerSequence = counter.sequence;

      // Generate the Dealer code
      const dealerCode = `TEJO-DEA-${String(dealerSequence).padStart(4, "0")}`;

      // Create Dealer
      const dealerResult = await Dealer.create(
        [
          {
            businessName,
            dealerSequence,
            dealerCode,
            phone,
            email: normalizedEmail,
            address,
            city,
            state,
            pincode,
          },
        ],
        { session },
      );

      newDealer = dealerResult[0];

      // Create linked Dealer User
      const userResult = await User.create(
        [
          {
            name: businessName,
            email: normalizedEmail,
            password,
            role: "DEALER",
            dealerId: newDealer._id,
          },
        ],
        { session },
      );

      newUser = userResult[0];
    });

    // Exclude password from response
    newUser.password = undefined;

    return res.status(201).json({
      message: "Dealer and Dealer user created successfully",
      dealer: newDealer,
      user: newUser,
    });
  } catch (error) {
    console.error("Failed to create Dealer:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A Dealer with this code or a User with this email already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create Dealer",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
});


Router.get("/",authMiddleware, authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const Alldealers = await Dealer.find({ isActive: true });

    res.status(200).json({
      message: "List of all active dealers",
      Alldealers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dealers",
      error: error.message,
    });
  }
});

Router.put("/:id",authMiddleware, authorizeRoles("ADMIN"), async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { businessName, phone, email, address, city, state, pincode } =
      req.body;

    // 1. Validate dealer ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid dealer ID",
      });
    }

    // 2. Find the dealer
    const dealer = await Dealer.findById(id);

    if (!dealer) {
      return res.status(404).json({
        message: "Dealer not found",
      });
    }

    // 3. Find the associated dealer user
    const dealerUser = await User.findOne({
      dealerId: dealer._id,
      role: "DEALER",
    });

    if (!dealerUser) {
      return res.status(404).json({
        message: "Associated dealer user not found",
      });
    }

    // 4. Normalize and validate the new email
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // 5. Check whether another user already uses this email
    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: dealerUser._id },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    // 6. Update both records in one transaction
    await session.withTransaction(async () => {
      await Dealer.updateOne(
        { _id: dealer._id },
        {
          $set: {
            businessName,
            phone,
            email: normalizedEmail,
            address,
            city,
            state,
            pincode,
          },
        },
        { session, runValidators: true },
      );

      await User.updateOne(
        { _id: dealerUser._id },
        {
          $set: {
            name: businessName,
            email: normalizedEmail,
          },
        },
        { session, runValidators: true },
      );
    });

    // 7. Return the updated records
    const updatedDealer = await Dealer.findById(id);
    const updatedUser = await User.findById(dealerUser._id).select("-password");

    return res.status(200).json({
      message: "Dealer and dealer user updated successfully",
      dealer: updatedDealer,
      user: updatedUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    console.error("Failed to update dealer:", error);

    return res.status(500).json({
      message: "Failed to update dealer",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
});

Router.patch("/:id/status",authMiddleware, authorizeRoles("ADMIN"), async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid dealer ID" });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false",
      });
    }

    const dealer = await Dealer.findById(id);

    if (!dealer) {
      return res.status(404).json({ message: "Dealer not found" });
    }

    const dealerUser = await User.findOne({
      dealerId: dealer._id,
      role: "DEALER",
    });

    if (!dealerUser) {
      return res.status(404).json({
        message: "Associated dealer user not found",
      });
    }

    await session.withTransaction(async () => {
      await Dealer.updateOne(
        { _id: dealer._id },
        { $set: { isActive } },
        { session, runValidators: true },
      );

      await User.updateOne(
        { _id: dealerUser._id },
        { $set: { isActive } },
        { session, runValidators: true },
      );
    });

    const updatedDealer = await Dealer.findById(id);
    const updatedUser = await User.findById(dealerUser._id).select("-password");

    return res.status(200).json({
      message: isActive
        ? "Dealer activated successfully"
        : "Dealer deactivated successfully",
      dealer: updatedDealer,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Failed to update dealer status:", error);

    return res.status(500).json({
      message: "Failed to update dealer status",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
});

Router.get("/all",authMiddleware, authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const { status } = req.query;
    

    const filter = {};
    

    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }

    const allDealers = await Dealer.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "List of all dealers",
      count: allDealers.length,
      dealers: allDealers,
    });
  } catch (error) {
    console.error("Failed to fetch all dealers:", error);

    return res.status(500).json({
      message: "Failed to fetch all dealers",
      error: error.message,
    });
  }
});

export default Router;

import express from "express";
import mongoose from "mongoose";
import SubDealer from "../models/SubDealer.js";
import User from "../models/User.js";
import Dealer from "../models/Dealer.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import Counter from "../models/Counter.js";

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
      dealerId,
    } = req.body;

    // 1. Validate required fields
    if (!businessName || !phone || !email || !password) {
      return res.status(400).json({
        message: "Business name, phone, email, and password are required",
      });
    }

    // 2. Validate Dealer ID
    if (!dealerId || !mongoose.Types.ObjectId.isValid(dealerId)) {
      return res.status(400).json({
        message: "A valid dealerId is required",
      });
    }

    // 3. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 4. Check duplicate email
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    let newSubDealer;
    let newUser;

    // 5. Create Sub-Dealer and User in one transaction
    await session.withTransaction(async () => {
      // Get the parent Dealer inside the transaction
      const dealer = await Dealer.findById(dealerId).session(session);

      if (!dealer) {
        throw new Error("DEALER_NOT_FOUND");
      }

      if (!dealer.isActive) {
        throw new Error("DEALER_INACTIVE");
      }

      if (!dealer.dealerSequence) {
        throw new Error("DEALER_SEQUENCE_NOT_INITIALIZED");
      }

      // Generate a separate counter for this parent Dealer
      const counter = await Counter.findOneAndUpdate(
        { scope: `SUBDEALER:${dealer._id}` },
        { $inc: { sequence: 1 } },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          session,
        },
      );

      const subDealerSequence = counter.sequence;

      // Generate Sub-Dealer code
      const subDealerCode =
        `TEJO-SUB-${String(dealer.dealerSequence).padStart(4, "0")}-${String(subDealerSequence).padStart(3, "0")}`;

      // Create Sub-Dealer
      const subDealerResult = await SubDealer.create(
        [
          {
            businessName,
            subDealerCode,
            phone,
            email: normalizedEmail,
            address,
            city,
            state,
            pincode,
            dealerId: dealer._id,
          },
        ],
        { session },
      );

      newSubDealer = subDealerResult[0];

      // Create linked Sub-Dealer User
      const userResult = await User.create(
        [
          {
            name: businessName,
            email: normalizedEmail,
            password,
            role: "SUB_DEALER",
            dealerId: dealer._id,
            subDealerId: newSubDealer._id,
          },
        ],
        { session },
      );

      newUser = userResult[0];
    });

    // 6. Exclude password from response
    const safeUser = await User.findById(newUser._id).select("-password");

    return res.status(201).json({
      message: "Sub Dealer and Sub Dealer user created successfully",
      subDealer: newSubDealer,
      user: safeUser,
    });
  } catch (error) {
    console.error("Failed to create Sub-Dealer:", error);

    if (error.message === "DEALER_NOT_FOUND") {
      return res.status(404).json({
        message: "Dealer not found",
      });
    }

    if (error.message === "DEALER_INACTIVE") {
      return res.status(400).json({
        message: "Cannot create a Sub-Dealer under an inactive Dealer",
      });
    }

    if (error.message === "DEALER_SEQUENCE_NOT_INITIALIZED") {
      return res.status(400).json({
        message: "The parent Dealer sequence is not initialized. Please initialize Dealer codes first.",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A Sub-Dealer with this code or a User with this email already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create Sub Dealer",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
});


Router.get("/", authMiddleware, authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const { dealerId, status } = req.query;
    const filter = {};

    // Filter by active/inactive status
    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Use active or inactive.",
        });
      }

      filter.isActive = status === "active";
    }

    // 2. Validate dealerId if provided
    if (dealerId) {
      if (!mongoose.Types.ObjectId.isValid(dealerId)) {
        return res.status(400).json({
          message: "Invalid dealerId",
        });
      }

      filter.dealerId = dealerId;
    }

    // 3. Fetch Sub-Dealers
    const subDealers = await SubDealer.find(filter)
      .populate("dealerId", "businessName dealerCode")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "List of Sub-Dealers",
      count: subDealers.length,
      subDealers,
    });
  } catch (error) {
    console.error("Failed to fetch Sub-Dealers:", error);

    return res.status(500).json({
      message: "Failed to fetch Sub-Dealers",
      error: error.message,
    });
  }
});

Router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    const session = await mongoose.startSession();

    try {
      const { id } = req.params;

      const { businessName, phone, email, address, city, state, pincode } =
        req.body;

      // 1. Validate Sub-Dealer ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid Sub-Dealer ID",
        });
      }

      // 2. Find Sub-Dealer
      const subDealer = await SubDealer.findById(id);

      if (!subDealer) {
        return res.status(404).json({
          message: "Sub-Dealer not found",
        });
      }

      // 3. Find linked User
      const subDealerUser = await User.findOne({
        subDealerId: subDealer._id,
        role: "SUB_DEALER",
      });

      if (!subDealerUser) {
        return res.status(404).json({
          message: "Associated Sub-Dealer user not found",
        });
      }

      // 4. Normalize and validate email
      const normalizedEmail = email?.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      // 5. Check duplicate email, excluding this User
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: subDealerUser._id },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "A user with this email already exists",
        });
      }

      // 6. Update both records in one transaction
      await session.withTransaction(async () => {
        await SubDealer.updateOne(
          { _id: subDealer._id },
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
          { _id: subDealerUser._id },
          {
            $set: {
              name: businessName,
              email: normalizedEmail,
            },
          },
          { session, runValidators: true },
        );
      });

      // 7. Return updated records
      const updatedSubDealer = await SubDealer.findById(id).populate(
        "dealerId",
        "businessName dealerCode",
      );

      const updatedUser = await User.findById(subDealerUser._id).select(
        "-password",
      );

      return res.status(200).json({
        message: "Sub-Dealer and User updated successfully",
        subDealer: updatedSubDealer,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Failed to update Sub-Dealer:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          message: "A Sub-Dealer with this code or User email already exists",
        });
      }

      return res.status(500).json({
        message: "Failed to update Sub-Dealer",
        error: error.message,
      });
    } finally {
      await session.endSession();
    }
  },
);

Router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    const session = await mongoose.startSession();

    try {
      const { id } = req.params;
      const { isActive } = req.body;

      // 1. Validate Sub-Dealer ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid Sub-Dealer ID",
        });
      }

      // 2. Validate status
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          message: "isActive must be true or false",
        });
      }

      // 3. Find Sub-Dealer
      const subDealer = await SubDealer.findById(id);

      if (!subDealer) {
        return res.status(404).json({
          message: "Sub-Dealer not found",
        });
      }

      // 4. Find associated User
      const subDealerUser = await User.findOne({
        subDealerId: subDealer._id,
        role: "SUB_DEALER",
      });

      if (!subDealerUser) {
        return res.status(404).json({
          message: "Associated Sub-Dealer user not found",
        });
      }

      // 5. Update both records in one transaction
      await session.withTransaction(async () => {
        await SubDealer.updateOne(
          { _id: subDealer._id },
          { $set: { isActive } },
          { session, runValidators: true },
        );

        await User.updateOne(
          { _id: subDealerUser._id },
          { $set: { isActive } },
          { session, runValidators: true },
        );
      });

      // 6. Return updated records
      const updatedSubDealer = await SubDealer.findById(id).populate(
        "dealerId",
        "businessName dealerCode",
      );

      const updatedUser = await User.findById(subDealerUser._id).select(
        "-password",
      );

      return res.status(200).json({
        message: isActive
          ? "Sub-Dealer activated successfully"
          : "Sub-Dealer deactivated successfully",
        subDealer: updatedSubDealer,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Failed to update Sub-Dealer status:", error);

      return res.status(500).json({
        message: "Failed to update Sub-Dealer status",
        error: error.message,
      });
    } finally {
      await session.endSession();
    }
  },
);

Router.get(
  "/summary",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      // 1. Get overall Sub-Dealer counts
      const [total, active, inactive] = await Promise.all([
        SubDealer.countDocuments(),
        SubDealer.countDocuments({ isActive: true }),
        SubDealer.countDocuments({ isActive: false }),
      ]);

      // 2. Group Sub-Dealers by parent Dealer
      const byDealer = await SubDealer.aggregate([
        {
          $group: {
            _id: "$dealerId",
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ["$isActive", true] }, 1, 0],
              },
            },
            inactive: {
              $sum: {
                $cond: [{ $eq: ["$isActive", false] }, 1, 0],
              },
            },
          },
        },
        {
          $lookup: {
            from: "dealers",
            localField: "_id",
            foreignField: "_id",
            as: "dealer",
          },
        },
        {
          $unwind: {
            path: "$dealer",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            dealerId: "$_id",
            businessName: {
              $ifNull: ["$dealer.businessName", "Unassigned Dealer"],
            },
            dealerCode: {
              $ifNull: ["$dealer.dealerCode", null],
            },
            total: 1,
            active: 1,
            inactive: 1,
          },
        },
        { $sort: { businessName: 1 } },
      ]);

      // 3. Return the summary
      return res.status(200).json({
        message: "Sub-Dealer summary fetched successfully",
        summary: {
          total,
          active,
          inactive,
        },
        byDealer,
      });
    } catch (error) {
      console.error("Failed to fetch Sub-Dealer summary:", error);

      return res.status(500).json({
        message: "Failed to fetch Sub-Dealer summary",
        error: error.message,
      });
    }
  },
);

Router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // 1. Validate the Sub-Dealer ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid Sub-Dealer ID",
        });
      }

      // 2. Find the Sub-Dealer and its parent Dealer
      const subDealer = await SubDealer.findById(id).populate(
        "dealerId",
        "businessName dealerCode",
      );

      if (!subDealer) {
        return res.status(404).json({
          message: "Sub-Dealer not found",
        });
      }

      // 3. Find the linked Sub-Dealer user
      const user = await User.findOne({
        subDealerId: subDealer._id,
        role: "SUB_DEALER",
      }).select("-password");

      // 4. Return the details
      return res.status(200).json({
        message: "Sub-Dealer details fetched successfully",
        subDealer,
        user,
      });
    } catch (error) {
      console.error("Failed to fetch Sub-Dealer details:", error);

      return res.status(500).json({
        message: "Failed to fetch Sub-Dealer details",
        error: error.message,
      });
    }
  },
);

export default Router;

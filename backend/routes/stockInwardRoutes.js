import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import StockInward from "../models/StockInward.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const Router = express.Router();


// ======================================================
// CREATE STOCK INWARD
// ======================================================

Router.post(
  "/",
  authMiddleware,
  permissionMiddleware("stockInwards.create"),
  async (req, res) => {
    try {
      const {
        gstRate,
        inventoryItem,
        model,
        batteryVariant,
        colour,
        chassisNumber,
        motorNumber,
        batteryNumber,
        controllerNumber,
        chargerNumber,
      } = req.body;

      const newStockInward = await StockInward.create({
        gstRate,
        inventoryItem,
        model,
        batteryVariant,
        colour,
        chassisNumber,
        motorNumber,
        batteryNumber,
        controllerNumber,
        chargerNumber,
        submittedBy: req.user._id,
        submittedByRole: req.user.role,
      });

      return res.status(201).json({
        message: "Stock submitted for approval",
        stockInward: newStockInward,
      });
    } catch (error) {
      console.error("Error creating stock inward:", error);

      return res.status(500).json({
        message: "Failed to submit stock",
        error: error.message,
      });
    }
  },
);


// ======================================================
// GET PENDING STOCK
// ======================================================

Router.get(
  "/pending",
  authMiddleware,
  permissionMiddleware("stockInwards.view"),
  async (req, res) => {
    try {
      const pendingStocks = await StockInward.find({
        status: "PENDING",
      })
        .populate("inventoryItem", "name")
        .populate("model", "name")
        .populate(
          "batteryVariant",
          "name power range warrantyYears warrantyKm",
        )
        .populate("submittedBy", "name email role");

      return res.status(200).json({
        message: "Pending stock entries",
        pendingStocks,
      });
    } catch (error) {
      console.error("Error fetching pending stock:", error);

      return res.status(500).json({
        message: "Failed to fetch pending stock",
        error: error.message,
      });
    }
  },
);


// ======================================================
// APPROVE STOCK
// ======================================================

Router.patch(
  "/:id/approve",
  authMiddleware,
  permissionMiddleware("stockInwards.approve"),
  async (req, res) => {
    const session = await mongoose.startSession();

    try {
      const { id } = req.params;
      const { source, destination } = req.body;

      const adminUser = req.user;

      // --------------------------------------------------
      // 1. Check admin
      // --------------------------------------------------

      if (adminUser.role !== "ADMIN") {
        return res.status(403).json({
          message: "Only Admin can approve stock",
        });
      }

      // --------------------------------------------------
      // 2. Find stock inward
      // --------------------------------------------------

      const stockInward = await StockInward.findById(id).session(session);

      if (!stockInward) {
        return res.status(404).json({
          message: "Stock entry not found",
        });
      }

      // --------------------------------------------------
      // 3. Make sure stock is still pending
      // --------------------------------------------------

      if (stockInward.status !== "PENDING") {
        return res.status(400).json({
          message: "Only pending stock can be approved",
        });
      }

      // --------------------------------------------------
      // 4. Validate source and destination
      // --------------------------------------------------

      if (!source || !destination) {
        return res.status(400).json({
          message: "Source and destination are required",
        });
      }

      let newVehicle;

      // ==================================================
      // TRANSACTION
      // ==================================================

      await session.withTransaction(async () => {

        // ------------------------------------------------
        // 5. Create Vehicle
        // ------------------------------------------------

        const vehicleResult = await Vehicle.create(
          [
            {
              gstRate: stockInward.gstRate,
              inventoryItem: stockInward.inventoryItem,
              model: stockInward.model,
              batteryVariant: stockInward.batteryVariant,
              colour: stockInward.colour,
              chassisNumber: stockInward.chassisNumber,
              motorNumber: stockInward.motorNumber,
              batteryNumber: stockInward.batteryNumber,
              controllerNumber: stockInward.controllerNumber,
              chargerNumber: stockInward.chargerNumber,

              // Ownership
              stockOwner: source,

              // Dealer allocation
              allocatedToType: "DEALER",
              allocatedToId: destination,

              // IMPORTANT:
              // This status belongs to Vehicle,
              // NOT StockInward.
              status: "PENDING_DEALER_ACCEPTANCE",
            },
          ],
          { session },
        );

        newVehicle = vehicleResult[0];

        // ------------------------------------------------
        // 6. Update Stock Inward
        // ------------------------------------------------

        stockInward.source = source;
        stockInward.destination = destination;
        stockInward.approvedBy = adminUser._id;
        stockInward.approvedAt = new Date();

        // IMPORTANT:
        // StockInward must become APPROVED.
        stockInward.status = "APPROVED";

        await stockInward.save({
          session,
        });
      });

      // ==================================================
      // SUCCESS
      // ==================================================

      return res.status(200).json({
        success: true,
        message: "Stock approved and vehicle added to inventory successfully",

        stockInward,

        vehicle: newVehicle,
      });

    } catch (error) {

      console.error("Error approving stock:", error);

      return res.status(500).json({
        message: "Failed to approve stock",
        error: error.message,
      });

    } finally {

      await session.endSession();

    }
  },
);


export default Router;
import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import StockInward from "../models/StockInward.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";


const Router = express.Router();

Router.post("/",  authMiddleware,
  permissionMiddleware("stockInwards.create"),async (req, res) => {
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

    res.status(201).json({
      message: "Stock submitted for approval",
      stockInward: newStockInward,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit stock",
      error: error.message,
    });
  }
});

Router.get("/pending", authMiddleware,
  permissionMiddleware("stockInwards.view"), async (req, res) => {
  try {
    const pendingStocks = await StockInward.find({
      status: "PENDING",
    })
      .populate("inventoryItem", "name")
      .populate("model", "name")
      .populate("batteryVariant", "name power range warrantyYears warrantyKm")
      .populate("submittedBy", "name email role");

    res.status(200).json({
      message: "Pending stock entries",
      pendingStocks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch pending stock",
      error: error.message,
    });
  }
});

Router.patch("/:id/approve",authMiddleware,
  permissionMiddleware("stockInwards.approve"), async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { source, destination } = req.body;

const adminUser = req.user;

if (adminUser.role !== "ADMIN") {
  return res.status(403).json({
    message: "Only Admin can approve stock",
  });
}

    const stockInward = await StockInward.findById(id);

    if (!stockInward) {
      return res.status(404).json({
        message: "Stock entry not found",
      });
    }

    if (stockInward.status !== "PENDING") {
      return res.status(400).json({
        message: "Only pending stock can be approved",
      });
    }

    if (!source || !destination) {
      return res.status(400).json({
        message: "Source and destination are required",
      });
    }

    let newVehicle;

    await session.withTransaction(async () => {
      // 1. Create Vehicle
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

            stockOwner: source,
            allocatedToType: "DEALER",
            allocatedToId: destination,
            status: "ALLOCATED",
          },
        ],
        { session }
      );

      newVehicle = vehicleResult[0];

      // 2. Update Stock Inward
      stockInward.source = source;
      stockInward.destination = destination;
      stockInward.approvedBy = adminUser._id;
      stockInward.approvedAt = new Date();
      stockInward.status = "APPROVED";

      await stockInward.save({ session });
    });

    res.status(200).json({
      message: "Stock approved and vehicle added to inventory successfully",
      stockInward,
      vehicle: newVehicle,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve stock",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
});

export default Router;
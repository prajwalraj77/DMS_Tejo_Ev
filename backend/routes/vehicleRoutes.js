import express from "express";
const Router = express.Router();
import Vehicle from "../models/Vehicle.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

Router.post("/",authMiddleware,
  permissionMiddleware("vehicles.create"), async (req, res) => {
  try {
    const {
      gstRate,
      inventoryItem,
      stockOwner,
      allocatedToType,
      allocatedToId,
      status,
      model,
      batteryVariant,
      chassisNumber,
      colour,
      motorNumber,
      controllerNumber,
      batteryNumber,
      chargerNumber,
    } = req.body;

    const newVehicle = await Vehicle.create({
      gstRate,
      inventoryItem,
      stockOwner,
      allocatedToType,
      allocatedToId,
      status,
      model,
      batteryVariant,
      chassisNumber,
      colour,
      motorNumber,
      controllerNumber,
      batteryNumber,
      chargerNumber,
    });

    res.status(200).json({
      message: "Vehicle created",
      newVehicle,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create Vehicle",
      error: error.message,
    });
  }
});

// ============================================
// DEALER PENDING ACCEPTANCE
// ============================================

Router.get(
  "/dealer/pending-acceptance",
  authMiddleware,
  async (req, res) => {
    try {
      // Only DEALER users can access this API
      if (req.user.role !== "DEALER") {
        return res.status(403).json({
          message: "Only dealers can view pending vehicle acceptance."
        });
      }

      // Dealer ID comes from the authenticated user.
      // Never take dealerId from req.body/query for this operation.
      const dealerId = req.user.dealerId;

      if (!dealerId) {
        return res.status(400).json({
          message: "Dealer account is not properly linked."
        });
      }

      const vehicles = await Vehicle.find({
        allocatedToType: "DEALER",
        allocatedToId: dealerId,
        status: "PENDING_DEALER_ACCEPTANCE"
      })
        .populate("inventoryItem")
        .populate("model")
        .populate("batteryVariant")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: vehicles.length,
        vehicles
      });
    } catch (error) {
      console.error("Error fetching pending dealer vehicles:", error);

      return res.status(500).json({
        message: "Failed to fetch pending dealer vehicles."
      });
    }
  }
);

Router.get("/",authMiddleware,
  permissionMiddleware("vehicles.view"), async (req, res) => {
  try {
    const allVehicle = await Vehicle.find()
      .populate("inventoryItem", "name")
      .populate("model", "name")
      .populate("batteryVariant", "name power range warrantyYears warrantyKm")
      .populate("allocatedToId", "businessName dealerCode")

    res.status(200).json({
      message: "All Vehicle list",
      allVehicle,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Get all Vehicle",
      error: error.message,
    });
  }
});

// ============================================
// DEALER ACCEPT VEHICLE
// ============================================

Router.patch(
  "/:id/accept",
  authMiddleware,
  async (req, res) => {
    try {
      // Only DEALER users can accept dealer stock
      if (req.user.role !== "DEALER") {
        return res.status(403).json({
          message: "Only dealers can accept vehicles."
        });
      }

      const dealerId = req.user.dealerId;

      if (!dealerId) {
        return res.status(400).json({
          message: "Dealer account is not properly linked."
        });
      }

      const vehicle = await Vehicle.findById(req.params.id);

      if (!vehicle) {
        return res.status(404).json({
          message: "Vehicle not found."
        });
      }

      // Make sure this vehicle actually belongs
      // to the logged-in dealer.
      if (
        vehicle.allocatedToType !== "DEALER" ||
        String(vehicle.allocatedToId) !== String(dealerId)
      ) {
        return res.status(403).json({
          message: "This vehicle is not assigned to your dealer."
        });
      }

      // Prevent accepting an already accepted vehicle
      if (vehicle.status !== "PENDING_DEALER_ACCEPTANCE") {
        return res.status(400).json({
          message: `Vehicle cannot be accepted because its current status is ${vehicle.status}.`
        });
      }

      // Accept the vehicle
      vehicle.status = "ALLOCATED";

      await vehicle.save();

      return res.status(200).json({
        success: true,
        message: "Vehicle accepted successfully.",
        vehicle
      });
    } catch (error) {
      console.error("Error accepting vehicle:", error);

      return res.status(500).json({
        message: "Failed to accept vehicle."
      });
    }
  }
);

export default Router;

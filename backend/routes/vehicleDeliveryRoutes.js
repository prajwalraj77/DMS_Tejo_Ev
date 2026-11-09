import express from "express";
import mongoose from "mongoose";

import authMiddleware from "../middleware/authMiddleware.js";

import VehicleDelivery from "../models/VehicleDelivery.js";
import SaleInvoice from "../models/SaleInvoice.js";
import Vehicle from "../models/Vehicle.js";
import Customer from "../models/Customer.js";

const Router = express.Router();

// ======================================================
// CREATE VEHICLE DELIVERY
// POST /api/vehicle-deliveries
// ======================================================

Router.post("/", authMiddleware, async (req, res) => {
  try {
    // --------------------------------------------------
    // Only Dealers can deliver vehicles
    // --------------------------------------------------

    if (req.user.role !== "DEALER") {
      return res.status(403).json({
        message: "Only dealers can record vehicle delivery.",
      });
    }

    const dealerId = req.user.dealerId;

    if (!dealerId) {
      return res.status(400).json({
        message: "Dealer account is not properly linked.",
      });
    }

    // --------------------------------------------------
    // Get request data
    // --------------------------------------------------

    const {
      invoiceId,
      vehicleId,
      deliveryDate,
      deliveredBy,
      remarks,
    } = req.body;

    // --------------------------------------------------
    // Required fields
    // --------------------------------------------------

    if (!invoiceId || !vehicleId || !deliveredBy) {
      return res.status(400).json({
        message:
          "Invoice ID, vehicle ID, and delivered by are required.",
      });
    }

    // --------------------------------------------------
    // Validate ObjectIds
    // --------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(invoiceId) ||
      !mongoose.Types.ObjectId.isValid(vehicleId)
    ) {
      return res.status(400).json({
        message: "Invalid invoice ID or vehicle ID.",
      });
    }

    // ==================================================
    // FIND INVOICE
    // ==================================================

    const invoice = await SaleInvoice.findOne({
      _id: invoiceId,
      dealerId: dealerId,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Sale invoice not found for this dealer.",
      });
    }

    // --------------------------------------------------
    // Invoice must be paid
    // --------------------------------------------------

    if (invoice.paymentStatus !== "PAID") {
      return res.status(400).json({
        message:
          "Vehicle cannot be delivered because the invoice is not fully paid.",
      });
    }

    // --------------------------------------------------
    // Invoice must be issued
    // --------------------------------------------------

    if (invoice.status !== "ISSUED") {
      return res.status(400).json({
        message: "Vehicle cannot be delivered from this invoice.",
      });
    }

    // --------------------------------------------------
    // Make sure requested vehicle matches invoice vehicle
    // --------------------------------------------------

    if (String(invoice.vehicleId) !== String(vehicleId)) {
      return res.status(400).json({
        message:
          "The vehicle does not match the vehicle on the sale invoice.",
      });
    }

    // ==================================================
    // FIND VEHICLE
    // ==================================================

    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      allocatedToType: "DEALER",
      allocatedToId: dealerId,
    });

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found for this dealer.",
      });
    }

    // --------------------------------------------------
    // Vehicle must be SOLD before delivery
    // --------------------------------------------------

    if (vehicle.status !== "SOLD") {
      return res.status(400).json({
        message:
          `Vehicle cannot be delivered because its current status is ${vehicle.status}.`,
      });
    }

    // ==================================================
    // CHECK EXISTING DELIVERY
    // ==================================================

    const existingDelivery = await VehicleDelivery.findOne({
      vehicleId: vehicleId,
      status: "DELIVERED",
    });

    if (existingDelivery) {
      return res.status(409).json({
        message: "This vehicle has already been delivered.",
        deliveryId: existingDelivery._id,
      });
    }

    // ==================================================
    // FIND CUSTOMER
    // ==================================================

    const customer = await Customer.findOne({
      _id: invoice.customerId,
      dealerId: dealerId,
      isActive: true,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer associated with this invoice was not found.",
      });
    }

    // ==================================================
    // CREATE DELIVERY RECORD
    // ==================================================

    const delivery = await VehicleDelivery.create({
      vehicleId,
      invoiceId,
      customerId: invoice.customerId,
      dealerId,
      deliveryDate: deliveryDate || new Date(),
      deliveredBy,
      remarks: remarks || "",
      status: "DELIVERED",
    });

    // ==================================================
    // UPDATE VEHICLE STATUS
    // ==================================================

    vehicle.status = "DELIVERED";

    await vehicle.save();

    // ==================================================
    // RETURN DELIVERY
    // ==================================================

    const populatedDelivery = await VehicleDelivery.findById(
      delivery._id,
    )
      .populate("vehicleId")
      .populate("invoiceId")
      .populate("customerId")
      .populate("dealerId");

    return res.status(201).json({
      success: true,
      message: "Vehicle delivered successfully.",
      delivery: populatedDelivery,
    });
  } catch (error) {
    console.error("Error recording vehicle delivery:", error);

    // Duplicate delivery protection
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A delivery record already exists for this vehicle or invoice.",
      });
    }

    return res.status(500).json({
      message: "Failed to record vehicle delivery.",
    });
  }
});


// ======================================================
// GET DELIVERIES FOR LOGGED-IN DEALER
// GET /api/vehicle-deliveries
// ======================================================

Router.get("/", authMiddleware, async (req, res) => {
  try {
    // --------------------------------------------------
    // Only Dealers can view their deliveries
    // --------------------------------------------------

    if (req.user.role !== "DEALER") {
      return res.status(403).json({
        message: "Only dealers can view vehicle deliveries.",
      });
    }

    const dealerId = req.user.dealerId;

    if (!dealerId) {
      return res.status(400).json({
        message: "Dealer account is not properly linked.",
      });
    }

    const deliveries = await VehicleDelivery.find({
      dealerId: dealerId,
    })
      .populate("vehicleId")
      .populate("invoiceId")
      .populate("customerId")
      .sort({ deliveryDate: -1 });

    return res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries,
    });
  } catch (error) {
    console.error("Error fetching vehicle deliveries:", error);

    return res.status(500).json({
      message: "Failed to fetch vehicle deliveries.",
    });
  }
});


// ======================================================
// GET SINGLE DELIVERY
// GET /api/vehicle-deliveries/:id
// ======================================================

Router.get("/:id", authMiddleware, async (req, res) => {
  try {
    // --------------------------------------------------
    // Only Dealers can view delivery details
    // --------------------------------------------------

    if (req.user.role !== "DEALER") {
      return res.status(403).json({
        message: "Only dealers can view vehicle delivery details.",
      });
    }

    const dealerId = req.user.dealerId;
    const { id } = req.params;

    if (!dealerId) {
      return res.status(400).json({
        message: "Dealer account is not properly linked.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid delivery ID.",
      });
    }

    const delivery = await VehicleDelivery.findOne({
      _id: id,
      dealerId: dealerId,
    })
      .populate("vehicleId")
      .populate("invoiceId")
      .populate("customerId")
      .populate("dealerId");

    if (!delivery) {
      return res.status(404).json({
        message: "Vehicle delivery not found.",
      });
    }

    return res.status(200).json({
      success: true,
      delivery,
    });
  } catch (error) {
    console.error("Error fetching delivery:", error);

    return res.status(500).json({
      message: "Failed to fetch vehicle delivery.",
    });
  }
});

export default Router;
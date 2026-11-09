import express from "express";
import Customer from "../models/Customer.js";
import Dealer from "../models/Dealer.js";
import authMiddleware from "../middleware/authMiddleware.js";

const Router = express.Router();


// ======================================================
// CREATE CUSTOMER
// ======================================================

Router.post("/", authMiddleware, async (req, res) => {
  try {
    // Only dealers can create customers
    if (req.user.role !== "DEALER") {
      return res.status(403).json({
        message: "Only dealers can create customers.",
      });
    }

    const dealerId = req.user.dealerId;

    if (!dealerId) {
      return res.status(400).json({
        message: "Dealer account is not properly linked.",
      });
    }

    const {
      name,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      gstin,
    } = req.body;

    // Required fields
    if (!name || !phone || !email) {
      return res.status(400).json({
        message: "Name, phone, and email are required.",
      });
    }

    // Verify dealer exists and is active
    const dealer = await Dealer.findById(dealerId);

    if (!dealer || !dealer.isActive) {
      return res.status(403).json({
        message: "Dealer account is inactive or unavailable.",
      });
    }

    const customer = await Customer.create({
      name,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      gstin,
      dealerId,
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      customer,
    });

  } catch (error) {
    console.error("Error creating customer:", error);

    return res.status(500).json({
      message: "Failed to create customer.",
      error: error.message,
    });
  }
});


// ======================================================
// GET DEALER CUSTOMERS
// ======================================================

Router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "DEALER") {
      return res.status(403).json({
        message: "Only dealers can view customers.",
      });
    }

    const dealerId = req.user.dealerId;

    if (!dealerId) {
      return res.status(400).json({
        message: "Dealer account is not properly linked.",
      });
    }

    const customers = await Customer.find({
      dealerId,
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });

  } catch (error) {
    console.error("Error fetching customers:", error);

    return res.status(500).json({
      message: "Failed to fetch customers.",
      error: error.message,
    });
  }
});


export default Router;
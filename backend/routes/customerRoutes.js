import express from "express";
import Customer from "../models/Customer.js";
import Dealer from "../models/Dealer.js";
import authMiddleware from "../middleware/authMiddleware.js";

const Router = express.Router();


// =====================================================
// CREATE CUSTOMER
// =====================================================

Router.post("/", authMiddleware, async (req, res) => {
  try {
    // During development:
    // ADMIN and DEALER can create customers.
    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "DEALER"
    ) {
      return res.status(403).json({
        message: "You do not have permission to create customers.",
      });
    }

    const dealerId = req.user.dealerId;

    /*
     * ADMIN may not have dealerId.
     *
     * For now, allow ADMIN to create customers without
     * forcing a dealer relationship.
     *
     * Later, when Admin creates an invoice for a selected
     * dealer/sub-dealer, we can introduce dealer selection
     * properly.
     */
    if (req.user.role === "DEALER" && !dealerId) {
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

    if (!name || !phone || !email) {
      return res.status(400).json({
        message: "Name, phone, and email are required.",
      });
    }

    // Only verify Dealer account when logged in user is DEALER.
    if (req.user.role === "DEALER") {
      const dealer = await Dealer.findById(dealerId);

      if (!dealer || !dealer.isActive) {
        return res.status(403).json({
          message: "Dealer account is inactive or unavailable.",
        });
      }
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

      /*
       * Dealer gets their dealerId.
       * ADMIN gets null for now.
       */
      dealerId: req.user.role === "DEALER" ? dealerId : null,
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


// =====================================================
// GET CUSTOMERS
// =====================================================

Router.get("/", authMiddleware, async (req, res) => {
  try {
    // ADMIN can view ALL customers.
    if (req.user.role === "ADMIN") {
      const customers = await Customer.find({
        isActive: true,
      })
        .sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        count: customers.length,
        customers,
      });
    }

    // DEALER can only view their own customers.
    if (req.user.role === "DEALER") {
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
    }

    return res.status(403).json({
      message: "You do not have permission to view customers.",
    });

  } catch (error) {
    console.error("Error fetching customers:", error);

    return res.status(500).json({
      message: "Failed to fetch customers.",
      error: error.message,
    });
  }
});


// =====================================================
// GET SINGLE CUSTOMER
// =====================================================

Router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer || !customer.isActive) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    // ADMIN can access any customer.
    if (req.user.role === "ADMIN") {
      return res.status(200).json({
        success: true,
        customer,
      });
    }

    // DEALER can only access their own customer.
    if (
      req.user.role === "DEALER" &&
      customer.dealerId?.toString() === req.user.dealerId?.toString()
    ) {
      return res.status(200).json({
        success: true,
        customer,
      });
    }

    return res.status(403).json({
      message: "You do not have permission to view this customer.",
    });

  } catch (error) {
    console.error("Error fetching customer:", error);

    return res.status(500).json({
      message: "Failed to fetch customer.",
      error: error.message,
    });
  }
});


// =====================================================
// UPDATE CUSTOMER
// =====================================================

Router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer || !customer.isActive) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    /*
     * ADMIN can edit any customer.
     *
     * DEALER can only edit customers belonging
     * to that dealer.
     */
    if (req.user.role === "DEALER") {
      if (
        !customer.dealerId ||
        customer.dealerId.toString() !== req.user.dealerId?.toString()
      ) {
        return res.status(403).json({
          message: "You do not have permission to edit this customer.",
        });
      }
    } else if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "You do not have permission to edit customers.",
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

    if (!name || !phone || !email) {
      return res.status(400).json({
        message: "Name, phone, and email are required.",
      });
    }

    customer.name = name.trim();
    customer.phone = phone.trim();
    customer.email = email.trim().toLowerCase();

    customer.address = address?.trim() || "";
    customer.city = city?.trim() || "";
    customer.state = state?.trim() || "";
    customer.pincode = pincode?.trim() || "";
    customer.gstin = gstin?.trim().toUpperCase() || "";

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully.",
      customer,
    });

  } catch (error) {
    console.error("Error updating customer:", error);

    return res.status(500).json({
      message: "Failed to update customer.",
      error: error.message,
    });
  }
});


// =====================================================
// DELETE / DEACTIVATE CUSTOMER
// =====================================================

Router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer || !customer.isActive) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    // ADMIN can deactivate any customer.
    if (req.user.role === "ADMIN") {
      customer.isActive = false;
      await customer.save();

      return res.status(200).json({
        success: true,
        message: "Customer deactivated successfully.",
      });
    }

    // DEALER can deactivate only their own customer.
    if (req.user.role === "DEALER") {
      if (
        !customer.dealerId ||
        customer.dealerId.toString() !== req.user.dealerId?.toString()
      ) {
        return res.status(403).json({
          message: "You do not have permission to delete this customer.",
        });
      }

      customer.isActive = false;
      await customer.save();

      return res.status(200).json({
        success: true,
        message: "Customer deactivated successfully.",
      });
    }

    return res.status(403).json({
      message: "You do not have permission to delete customers.",
    });

  } catch (error) {
    console.error("Error deleting customer:", error);

    return res.status(500).json({
      message: "Failed to delete customer.",
      error: error.message,
    });
  }
});


export default Router;
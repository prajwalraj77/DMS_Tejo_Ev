import express from "express";
import mongoose from "mongoose";

import authMiddleware from "../middleware/authMiddleware.js";

import SaleInvoice from "../models/SaleInvoice.js";
import Vehicle from "../models/Vehicle.js";

const Router = express.Router();

// ======================================================
// UPDATE PAYMENT
// PATCH /api/sale-invoices/:id/payment
// ======================================================

Router.patch("/:id/payment", authMiddleware, async (req, res) => {
  try {
    // --------------------------------------------------
    // Only Dealers can collect payments
    // --------------------------------------------------

    if (req.user.role !== "DEALER") {
      return res.status(403).json({
        message: "Only dealers can collect payments.",
      });
    }

    const dealerId = req.user.dealerId;

    if (!dealerId) {
      return res.status(400).json({
        message: "Dealer account is not properly linked.",
      });
    }

    // --------------------------------------------------
    // Validate invoice ID
    // --------------------------------------------------

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid sale invoice ID.",
      });
    }

    // --------------------------------------------------
    // Get payment details
    // --------------------------------------------------

    const { amount, paymentMethod } = req.body;

    // --------------------------------------------------
    // Validate amount
    // --------------------------------------------------

    if (
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        message: "Payment amount must be greater than 0.",
      });
    }

    // --------------------------------------------------
    // Validate payment method
    // --------------------------------------------------

    const allowedPaymentMethods = [
      "CASH",
      "UPI",
      "BANK_TRANSFER",
      "CARD",
      "CHEQUE",
      "OTHER",
    ];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message:
          "Payment method must be CASH, UPI, BANK_TRANSFER, CARD, CHEQUE, or OTHER.",
      });
    }

    // ==================================================
    // FIND INVOICE
    // ==================================================

    const invoice = await SaleInvoice.findOne({
      _id: id,
      dealerId: dealerId,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Sale invoice not found for this dealer.",
      });
    }

    // --------------------------------------------------
    // Cancelled invoice cannot receive payment
    // --------------------------------------------------

    if (invoice.status === "CANCELLED") {
      return res.status(400).json({
        message: "Payment cannot be collected for a cancelled invoice.",
      });
    }

    // --------------------------------------------------
    // Already fully paid
    // --------------------------------------------------

    if (invoice.paymentStatus === "PAID") {
      return res.status(400).json({
        message: "This invoice has already been fully paid.",
      });
    }

    // ==================================================
    // CALCULATE REMAINING BALANCE
    // ==================================================

    const currentPaidAmount = Number(invoice.paidAmount || 0);

    const remainingAmount = Number(
      (invoice.totalAmount - currentPaidAmount).toFixed(2),
    );

    // --------------------------------------------------
    // Prevent overpayment
    // --------------------------------------------------

    if (amount > remainingAmount) {
      return res.status(400).json({
        message: "Payment amount cannot be greater than the remaining balance.",
        remainingAmount,
      });
    }

    // ==================================================
    // CALCULATE NEW PAYMENT
    // ==================================================

    const newPaidAmount = Number(
      (currentPaidAmount + amount).toFixed(2),
    );

    let newPaymentStatus;

    if (newPaidAmount === invoice.totalAmount) {
      newPaymentStatus = "PAID";
    } else {
      newPaymentStatus = "PARTIAL";
    }

    // ==================================================
    // UPDATE INVOICE
    // ==================================================

    invoice.paidAmount = newPaidAmount;
    invoice.paymentStatus = newPaymentStatus;
    invoice.paymentMethod = paymentMethod;

    await invoice.save();

    // ==================================================
    // IF FULLY PAID → VEHICLE SOLD
    // ==================================================

    let vehicle = null;

    if (newPaymentStatus === "PAID") {
      vehicle = await Vehicle.findOne({
        _id: invoice.vehicleId,
        allocatedToType: "DEALER",
        allocatedToId: dealerId,
        status: "ALLOCATED",
      });

      if (!vehicle) {
        return res.status(400).json({
          message:
            "Payment was recorded, but the vehicle could not be moved to SOLD.",
        });
      }

      vehicle.status = "SOLD";

      await vehicle.save();
    }

    // ==================================================
    // RETURN UPDATED INVOICE
    // ==================================================

    const updatedInvoice = await SaleInvoice.findById(invoice._id)
      .populate("dealerId")
      .populate("customerId")
      .populate("vehicleId");

    return res.status(200).json({
      success: true,
      message:
        newPaymentStatus === "PAID"
          ? "Payment completed successfully. Vehicle marked as SOLD."
          : "Partial payment recorded successfully.",
      payment: {
        paidAmount: newPaidAmount,
        remainingAmount: Number(
          (invoice.totalAmount - newPaidAmount).toFixed(2),
        ),
        paymentStatus: newPaymentStatus,
        paymentMethod,
      },
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("Error updating payment:", error);

    return res.status(500).json({
      message: "Failed to update payment.",
    });
  }
});

export default Router;
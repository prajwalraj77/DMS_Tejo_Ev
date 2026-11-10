import express from "express";
import mongoose from "mongoose";

import authMiddleware from "../middleware/authMiddleware.js";

import SaleInvoice from "../models/SaleInvoice.js";
import Dealer from "../models/Dealer.js";
import Customer from "../models/Customer.js";
import Vehicle from "../models/Vehicle.js";
import Counter from "../models/Counter.js";
import VehicleModel from "../models/VehicleModel.js";
import BatteryVariant from "../models/BatteryVariant.js";
import { generateSaleInvoicePdf } from "../services/saleInvoicePdf.js";

const Router = express.Router();

// ======================================================
// CREATE SALE INVOICE
// POST /api/sale-invoices
// ======================================================

Router.post("/", authMiddleware, async (req, res) => {
  try {
    // --------------------------------------------------
    // Only Dealers can create Sale Invoices
    // --------------------------------------------------

    if (req.user.role !== "DEALER") {
      return res.status(403).json({
        message: "Only dealers can create sale invoices.",
      });
    }

    const dealerId = req.user.dealerId;

    if (!dealerId) {
      return res.status(400).json({
        message: "Dealer account is not properly linked.",
      });
    }

    // --------------------------------------------------
    // Get input from request
    // --------------------------------------------------

    const {
      customerId,
      vehicleId,
      sellingPrice,
      discountType,
      discountValue,
      gstRate,
      gstTreatment,
    } = req.body;

    // --------------------------------------------------
    // Required fields
    // --------------------------------------------------

    if (
      !customerId ||
      !vehicleId ||
      sellingPrice === undefined ||
      !discountType ||
      discountValue === undefined ||
      gstRate === undefined ||
      !gstTreatment
    ) {
      return res.status(400).json({
        message:
          "Customer, vehicle, selling price, discount type, discount value, GST rate, and GST treatment are required.",
      });
    }

    // --------------------------------------------------
    // Validate ObjectIds
    // --------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(customerId) ||
      !mongoose.Types.ObjectId.isValid(vehicleId)
    ) {
      return res.status(400).json({
        message: "Invalid customer ID or vehicle ID.",
      });
    }

    // --------------------------------------------------
    // Validate numeric values
    // --------------------------------------------------

    if (
      typeof sellingPrice !== "number" ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice <= 0
    ) {
      return res.status(400).json({
        message: "Selling price must be a valid amount greater than 0.",
      });
    }

    if (
      typeof discountValue !== "number" ||
      !Number.isFinite(discountValue) ||
      discountValue < 0
    ) {
      return res.status(400).json({
        message: "Discount value must be a valid amount.",
      });
    }

    if (
      typeof gstRate !== "number" ||
      !Number.isFinite(gstRate) ||
      gstRate < 0 ||
      gstRate > 100
    ) {
      return res.status(400).json({
        message: "GST rate must be between 0 and 100.",
      });
    }

    // --------------------------------------------------
    // Validate discount type
    // --------------------------------------------------

    if (!["PERCENTAGE", "AMOUNT"].includes(discountType)) {
      return res.status(400).json({
        message: "Discount type must be PERCENTAGE or AMOUNT.",
      });
    }

    // --------------------------------------------------
    // Validate GST treatment
    // --------------------------------------------------

    if (!["INCLUDED", "EXTRA"].includes(gstTreatment)) {
      return res.status(400).json({
        message: "GST treatment must be INCLUDED or EXTRA.",
      });
    }

    // --------------------------------------------------
    // Validate percentage discount
    // --------------------------------------------------

    if (
      discountType === "PERCENTAGE" &&
      (discountValue < 0 || discountValue > 100)
    ) {
      return res.status(400).json({
        message: "Percentage discount must be between 0 and 100.",
      });
    }

    // --------------------------------------------------
    // Find dealer
    // --------------------------------------------------

    const dealer = await Dealer.findById(dealerId);

    if (!dealer) {
      return res.status(404).json({
        message: "Dealer not found.",
      });
    }

    if (!dealer.isActive) {
      return res.status(403).json({
        message: "Your dealer account is inactive.",
      });
    }

    // --------------------------------------------------
    // Find customer
    // IMPORTANT:
    // Customer must belong to logged-in dealer
    // --------------------------------------------------

    const customer = await Customer.findOne({
      _id: customerId,
      dealerId: dealerId,
      isActive: true,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found for this dealer.",
      });
    }

    // --------------------------------------------------
    // Find vehicle
    // IMPORTANT:
    // Vehicle must belong to logged-in dealer
    // AND must be ALLOCATED
    // --------------------------------------------------

    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      allocatedToType: "DEALER",
      allocatedToId: dealerId,
      status: "ALLOCATED",
    });

    if (!vehicle) {
      return res.status(400).json({
        message:
          "Vehicle is not allocated to your dealer or is not available for sale.",
      });
    }

    // --------------------------------------------------
    // Prevent duplicate sale invoice
    // --------------------------------------------------

    const existingInvoice = await SaleInvoice.findOne({
      vehicleId: vehicleId,
      status: {
        $ne: "CANCELLED",
      },
    });

    if (existingInvoice) {
      return res.status(409).json({
        message: "A sale invoice already exists for this vehicle.",
        invoiceNumber: existingInvoice.invoiceNumber,
      });
    }

    // ==================================================
    // CALCULATE DISCOUNT
    // ==================================================

    let discountAmount = 0;

    if (discountType === "PERCENTAGE") {
      discountAmount = (sellingPrice * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }

    // --------------------------------------------------
    // Discount cannot exceed selling price
    // --------------------------------------------------

    if (discountAmount > sellingPrice) {
      return res.status(400).json({
        message: "Discount cannot be greater than selling price.",
      });
    }

    // ==================================================
    // PRICE AFTER DISCOUNT
    // ==================================================

    const priceAfterDiscount = sellingPrice - discountAmount;

    let taxableAmount;
    let gstAmount;
    let totalAmount;

    // ==================================================
    // GST EXTRA
    // ==================================================

    if (gstTreatment === "EXTRA") {
      taxableAmount = priceAfterDiscount;

      gstAmount = (taxableAmount * gstRate) / 100;

      totalAmount = taxableAmount + gstAmount;
    }

    // ==================================================
    // GST INCLUDED
    // ==================================================

    else {
      // The entered price is already the final GST-inclusive
      // amount after discount.

      totalAmount = priceAfterDiscount;

      taxableAmount = totalAmount / (1 + gstRate / 100);

      gstAmount = totalAmount - taxableAmount;
    }

    // --------------------------------------------------
    // Round monetary values to 2 decimal places
    // --------------------------------------------------

    discountAmount = Number(discountAmount.toFixed(2));
    taxableAmount = Number(taxableAmount.toFixed(2));
    gstAmount = Number(gstAmount.toFixed(2));
    totalAmount = Number(totalAmount.toFixed(2));

    // ==================================================
    // GENERATE SALE INVOICE NUMBER
    // ==================================================

    const counter = await Counter.findOneAndUpdate(
      { scope: "saleInvoice" },
      { $inc: { sequence: 1 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    const year = new Date().getFullYear();

    const invoiceNumber = `TEJO-SALE-${year}-${String(
      counter.sequence,
    ).padStart(4, "0")}`;

    // ==================================================
    // CREATE INVOICE
    // ==================================================

    const saleInvoice = await SaleInvoice.create({
      invoiceNumber,

      dealerId,

      customerId,

      vehicleId,

      sellingPrice,

      discountType,

      discountValue,

      discountAmount,

      taxableAmount,

      gstRate,

      gstTreatment,

      gstAmount,

      totalAmount,

      paymentStatus: "PENDING",

      paidAmount: 0,

      status: "ISSUED",
    });

    // --------------------------------------------------
    // Return populated invoice
    // --------------------------------------------------

    const populatedInvoice = await SaleInvoice.findById(saleInvoice._id)
      .populate("dealerId")
      .populate("customerId")
      .populate({
        path: "vehicleId",
        populate: [
          { path: "model", model: VehicleModel },
          { path: "batteryVariant", model: BatteryVariant },
        ],
      });

    return res.status(201).json({
      success: true,
      message: "Sale invoice created successfully.",
      invoice: populatedInvoice,
    });
  } catch (error) {
    console.error("Error creating sale invoice:", error);

    // Duplicate key protection
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A sale invoice with this information already exists.",
      });
    }

    return res.status(500).json({
      message: "Failed to create sale invoice.",
    });
  }
});

// ======================================================
// GET ALL SALE INVOICES
// GET /api/sale-invoices
// ======================================================

Router.get("/", authMiddleware, async (req, res) => {
  try {
    // --------------------------------------------------
    // Only Dealers can view Sale Invoices
    // --------------------------------------------------

    if (req.user.role !== "DEALER") {
      return res.status(403).json({
        message: "Only dealers can view sale invoices.",
      });
    }

    const dealerId = req.user.dealerId;

    if (!dealerId) {
      return res.status(400).json({
        message: "Dealer account is not properly linked.",
      });
    }

    // --------------------------------------------------
    // Build dealer-scoped query
    // --------------------------------------------------

    const query = {
      dealerId: dealerId,
    };

    // --------------------------------------------------
    // Optional filters
    // --------------------------------------------------

    if (req.query.paymentStatus) {
      const allowedPaymentStatuses = [
        "PENDING",
        "PARTIAL",
        "PAID",
      ];

      if (!allowedPaymentStatuses.includes(req.query.paymentStatus)) {
        return res.status(400).json({
          message:
            "Invalid payment status. Use PENDING, PARTIAL, or PAID.",
        });
      }

      query.paymentStatus = req.query.paymentStatus;
    }

    if (req.query.status) {
      const allowedStatuses = [
        "DRAFT",
        "ISSUED",
        "CANCELLED",
      ];

      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          message:
            "Invalid invoice status. Use DRAFT, ISSUED, or CANCELLED.",
        });
      }

      query.status = req.query.status;
    }

    // --------------------------------------------------
    // Customer filter
    // --------------------------------------------------

    if (req.query.customerId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.customerId)) {
        return res.status(400).json({
          message: "Invalid customer ID.",
        });
      }

      query.customerId = req.query.customerId;
    }

    // --------------------------------------------------
    // Invoice number filter
    // --------------------------------------------------

    if (req.query.invoiceNumber) {
      query.invoiceNumber = {
        $regex: req.query.invoiceNumber,
        $options: "i",
      };
    }

    // --------------------------------------------------
    // Date filters
    // --------------------------------------------------

    if (req.query.fromDate || req.query.toDate) {
      query.createdAt = {};

      if (req.query.fromDate) {
        const fromDate = new Date(req.query.fromDate);

        if (Number.isNaN(fromDate.getTime())) {
          return res.status(400).json({
            message: "Invalid fromDate.",
          });
        }

        fromDate.setHours(0, 0, 0, 0);

        query.createdAt.$gte = fromDate;
      }

      if (req.query.toDate) {
        const toDate = new Date(req.query.toDate);

        if (Number.isNaN(toDate.getTime())) {
          return res.status(400).json({
            message: "Invalid toDate.",
          });
        }

        toDate.setHours(23, 59, 59, 999);

        query.createdAt.$lte = toDate;
      }
    }

    // --------------------------------------------------
    // Fetch invoices
    // --------------------------------------------------

    const invoices = await SaleInvoice.find(query)
      .populate("customerId")
      .populate("vehicleId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error("Error fetching sale invoices:", error);

    return res.status(500).json({
      message: "Failed to fetch sale invoices.",
    });
  }
});


// ======================================================
// GET SINGLE SALE INVOICE
// GET /api/sale-invoices/:id
// ======================================================

Router.get("/:id", authMiddleware, async (req, res) => {
  try {
    // --------------------------------------------------
    // Only Dealers can view Sale Invoice details
    // --------------------------------------------------

    if (req.user.role !== "DEALER") {
      return res.status(403).json({
        message: "Only dealers can view sale invoice details.",
      });
    }

    const dealerId = req.user.dealerId;
    const { id } = req.params;

    if (!dealerId) {
      return res.status(400).json({
        message: "Dealer account is not properly linked.",
      });
    }

    // --------------------------------------------------
    // Validate invoice ID
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid sale invoice ID.",
      });
    }

    // --------------------------------------------------
    // IMPORTANT:
    // Search using BOTH invoice ID and dealer ID.
    //
    // This prevents one dealer from accessing
    // another dealer's invoice.
    // --------------------------------------------------

    const invoice = await SaleInvoice.findOne({
      _id: id,
      dealerId: dealerId,
    })
      .populate("dealerId")
      .populate("customerId")
      .populate({
        path: "vehicleId",
        populate: [
          { path: "model", model: VehicleModel },
          { path: "batteryVariant", model: BatteryVariant },
        ],
      });

    if (!invoice) {
      return res.status(404).json({
        message: "Sale invoice not found.",
      });
    }

    return res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Error fetching sale invoice:", error);

    return res.status(500).json({
      message: "Failed to fetch sale invoice.",
    });
  }
});

// ======================================================
// ======================================================
// GET PRINTABLE SALE INVOICE DATA / PDF
// GET /api/sale-invoices/:id/print
// ======================================================

Router.get("/:id/print", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "DEALER") {
      return res.status(403).json({
        message: "Only dealers can print sale invoices.",
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
        message: "Invalid sale invoice ID.",
      });
    }

    const invoice = await SaleInvoice.findOne({
      _id: id,
      dealerId,
    })
      .populate("dealerId")
      .populate("customerId")
      .populate({
        path: "vehicleId",
        populate: [
          { path: "model", model: VehicleModel },
          { path: "batteryVariant", model: BatteryVariant },
        ],
      });

    if (!invoice) {
      return res.status(404).json({
        message: "Sale invoice not found.",
      });
    }

    if (req.query.format === "json") {
      const balanceAmount = Number(
        (invoice.totalAmount - invoice.paidAmount).toFixed(2),
      );

      return res.status(200).json({
        success: true,
        invoice: {
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.createdAt,
          dealer: invoice.dealerId,
          customer: invoice.customerId,
          vehicle: invoice.vehicleId,
          pricing: {
            sellingPrice: invoice.sellingPrice,
            discountType: invoice.discountType,
            discountValue: invoice.discountValue,
            discountAmount: invoice.discountAmount,
            taxableAmount: invoice.taxableAmount,
            gstRate: invoice.gstRate,
            gstTreatment: invoice.gstTreatment,
            gstAmount: invoice.gstAmount,
            totalAmount: invoice.totalAmount,
          },
          payment: {
            paymentStatus: invoice.paymentStatus,
            paymentMethod: invoice.paymentMethod,
            paidAmount: invoice.paidAmount,
            balanceAmount,
          },
          status: invoice.status,
        },
      });
    }

    const pdfBuffer = generateSaleInvoicePdf(invoice);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${invoice.invoiceNumber}.pdf"`,
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Error generating sale invoice PDF:", error);

    return res.status(500).json({
      message: "Failed to generate sale invoice PDF.",
    });
  }
});

export default Router;

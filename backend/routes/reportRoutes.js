import express from "express";
import mongoose from "mongoose";

import authMiddleware from "../middleware/authMiddleware.js";
import SaleInvoice from "../models/SaleInvoice.js";
import Vehicle from "../models/Vehicle.js";
import VehicleDelivery from "../models/VehicleDelivery.js";
import Customer from "../models/Customer.js";

const Router = express.Router();

/* ============================================================
   HELPERS
============================================================ */

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const parseDate = (dateString, isEndDate = false) => {
  if (!dateString) return null;

  const date = new Date(
    `${dateString}T${isEndDate ? "23:59:59.999" : "00:00:00.000"}Z`,
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

/* ============================================================
   SALES REPORT
   GET /api/reports/sales
============================================================ */

Router.get("/sales", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "DEALER") {
      return res.status(403).json({
        message: "Only dealers can access sales reports.",
      });
    }

    const dealerId = req.user.dealerId;

    if (!dealerId || !isValidObjectId(dealerId)) {
      return res.status(400).json({
        message: "Dealer account is not properly linked.",
      });
    }

    const {
      fromDate,
      toDate,
      paymentStatus,
      status,
      customerId,
      invoiceNumber,
    } = req.query;

    const filter = {
      dealerId,
    };

    /* --------------------------------------------------------
       STATUS FILTER
    -------------------------------------------------------- */

    if (status) {
      const allowedStatuses = ["DRAFT", "ISSUED", "CANCELLED"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid invoice status.",
        });
      }

      filter.status = status;
    } else {
      // Reports exclude cancelled invoices by default.
      filter.status = { $ne: "CANCELLED" };
    }

    /* --------------------------------------------------------
       PAYMENT STATUS FILTER
    -------------------------------------------------------- */

    if (paymentStatus) {
      const allowedPaymentStatuses = [
        "PENDING",
        "PARTIAL",
        "PAID",
      ];

      if (!allowedPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          message: "Invalid payment status.",
        });
      }

      filter.paymentStatus = paymentStatus;
    }

    /* --------------------------------------------------------
       CUSTOMER FILTER
    -------------------------------------------------------- */

    if (customerId) {
      if (!isValidObjectId(customerId)) {
        return res.status(400).json({
          message: "Invalid customer ID.",
        });
      }

      const customer = await Customer.findOne({
        _id: customerId,
        dealerId,
      });

      if (!customer) {
        return res.status(404).json({
          message: "Customer not found for this dealer.",
        });
      }

      filter.customerId = customerId;
    }

    /* --------------------------------------------------------
       INVOICE NUMBER FILTER
    -------------------------------------------------------- */

    if (invoiceNumber) {
      filter.invoiceNumber = {
        $regex: invoiceNumber.trim(),
        $options: "i",
      };
    }

    /* --------------------------------------------------------
       DATE FILTER
    -------------------------------------------------------- */

    if (fromDate || toDate) {
      filter.createdAt = {};

      if (fromDate) {
        const startDate = parseDate(fromDate);

        if (!startDate) {
          return res.status(400).json({
            message: "Invalid fromDate. Use YYYY-MM-DD.",
          });
        }

        filter.createdAt.$gte = startDate;
      }

      if (toDate) {
        const endDate = parseDate(toDate, true);

        if (!endDate) {
          return res.status(400).json({
            message: "Invalid toDate. Use YYYY-MM-DD.",
          });
        }

        filter.createdAt.$lte = endDate;
      }
    }

    /* --------------------------------------------------------
       FETCH INVOICES
    -------------------------------------------------------- */

    const invoices = await SaleInvoice.find(filter)
      .populate(
        "customerId",
        "name phone email address city state pincode gstin",
      )
      .populate(
        "vehicleId",
        "registrationNumber chassisNumber motorNumber batteryNumber model variant color status",
      )
      .sort({ createdAt: -1 });

    /* --------------------------------------------------------
       SUMMARY
    -------------------------------------------------------- */

    let totalSellingPrice = 0;
    let totalDiscount = 0;
    let totalTaxableAmount = 0;
    let totalGST = 0;
    let totalSales = 0;
    let totalPaid = 0;

    for (const invoice of invoices) {
      totalSellingPrice += Number(invoice.sellingPrice || 0);
      totalDiscount += Number(invoice.discountAmount || 0);
      totalTaxableAmount += Number(invoice.taxableAmount || 0);
      totalGST += Number(invoice.gstAmount || 0);
      totalSales += Number(invoice.totalAmount || 0);
      totalPaid += Number(invoice.paidAmount || 0);
    }

    const totalOutstanding = totalSales - totalPaid;

    return res.status(200).json({
      success: true,

      filters: {
        fromDate: fromDate || null,
        toDate: toDate || null,
        paymentStatus: paymentStatus || null,
        status: status || null,
        customerId: customerId || null,
        invoiceNumber: invoiceNumber || null,
      },

      summary: {
        totalInvoices: invoices.length,
        totalSellingPrice: Number(totalSellingPrice.toFixed(2)),
        totalDiscount: Number(totalDiscount.toFixed(2)),
        totalTaxableAmount: Number(totalTaxableAmount.toFixed(2)),
        totalGST: Number(totalGST.toFixed(2)),
        totalSales: Number(totalSales.toFixed(2)),
        totalPaid: Number(totalPaid.toFixed(2)),
        totalOutstanding: Number(totalOutstanding.toFixed(2)),
      },

      invoices,
    });
  } catch (error) {
    console.error("Error generating sales report:", error);

    return res.status(500).json({
      message: "Failed to generate sales report.",
    });
  }
});

/* ============================================================
   INVENTORY REPORT
   GET /api/reports/inventory
============================================================ */

Router.get("/inventory", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "DEALER") {
      return res.status(403).json({
        message: "Only dealers can access inventory reports.",
      });
    }

    const dealerId = req.user.dealerId;

    if (!dealerId || !isValidObjectId(dealerId)) {
      return res.status(400).json({
        message: "Dealer account is not properly linked.",
      });
    }

    const { status } = req.query;

    const allowedStatuses = [
      "PENDING_DEALER_ACCEPTANCE",
      "ALLOCATED",
      "SOLD",
      "DELIVERED",
    ];

    const filter = {
      allocatedToType: "DEALER",
      allocatedToId: dealerId,
    };

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid inventory status.",
        });
      }

      filter.status = status;
    }

    const vehicles = await Vehicle.find(filter).sort({
      createdAt: -1,
    });

    /* --------------------------------------------------------
       STATUS SUMMARY
    -------------------------------------------------------- */

    const summary = {
      total: vehicles.length,
      pendingDealerAcceptance: 0,
      allocated: 0,
      sold: 0,
      delivered: 0,
    };

    for (const vehicle of vehicles) {
      switch (vehicle.status) {
        case "PENDING_DEALER_ACCEPTANCE":
          summary.pendingDealerAcceptance += 1;
          break;

        case "ALLOCATED":
          summary.allocated += 1;
          break;

        case "SOLD":
          summary.sold += 1;
          break;

        case "DELIVERED":
          summary.delivered += 1;
          break;
      }
    }

    return res.status(200).json({
      success: true,

      filters: {
        status: status || null,
      },

      summary,

      vehicles,
    });
  } catch (error) {
    console.error("Error generating inventory report:", error);

    return res.status(500).json({
      message: "Failed to generate inventory report.",
    });
  }
});

/* ============================================================
   DELIVERY REPORT
   GET /api/reports/deliveries
============================================================ */

Router.get("/deliveries", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "DEALER") {
      return res.status(403).json({
        message: "Only dealers can access delivery reports.",
      });
    }

    const dealerId = req.user.dealerId;

    if (!dealerId || !isValidObjectId(dealerId)) {
      return res.status(400).json({
        message: "Dealer account is not properly linked.",
      });
    }

    const {
      fromDate,
      toDate,
      status,
      customerId,
    } = req.query;

    const filter = {
      dealerId,
    };

    /* --------------------------------------------------------
       DELIVERY STATUS
    -------------------------------------------------------- */

    if (status) {
      const allowedStatuses = [
        "DELIVERED",
        "CANCELLED",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid delivery status.",
        });
      }

      filter.status = status;
    } else {
      filter.status = "DELIVERED";
    }

    /* --------------------------------------------------------
       CUSTOMER FILTER
    -------------------------------------------------------- */

    if (customerId) {
      if (!isValidObjectId(customerId)) {
        return res.status(400).json({
          message: "Invalid customer ID.",
        });
      }

      const customer = await Customer.findOne({
        _id: customerId,
        dealerId,
      });

      if (!customer) {
        return res.status(404).json({
          message: "Customer not found for this dealer.",
        });
      }

      filter.customerId = customerId;
    }

    /* --------------------------------------------------------
       DATE FILTER
    -------------------------------------------------------- */

    if (fromDate || toDate) {
      filter.deliveryDate = {};

      if (fromDate) {
        const startDate = parseDate(fromDate);

        if (!startDate) {
          return res.status(400).json({
            message: "Invalid fromDate. Use YYYY-MM-DD.",
          });
        }

        filter.deliveryDate.$gte = startDate;
      }

      if (toDate) {
        const endDate = parseDate(toDate, true);

        if (!endDate) {
          return res.status(400).json({
            message: "Invalid toDate. Use YYYY-MM-DD.",
          });
        }

        filter.deliveryDate.$lte = endDate;
      }
    }

    /* --------------------------------------------------------
       FETCH DELIVERIES
    -------------------------------------------------------- */

    const deliveries = await VehicleDelivery.find(filter)
      .populate(
        "customerId",
        "name phone email address city state pincode gstin",
      )
      .populate(
        "vehicleId",
        "registrationNumber chassisNumber motorNumber batteryNumber model variant color status",
      )
      .populate(
        "invoiceId",
        "invoiceNumber sellingPrice discountAmount gstAmount totalAmount paidAmount paymentStatus",
      )
      .sort({ deliveryDate: -1 });

    return res.status(200).json({
      success: true,

      filters: {
        fromDate: fromDate || null,
        toDate: toDate || null,
        status: status || null,
        customerId: customerId || null,
      },

      summary: {
        totalDeliveries: deliveries.length,
      },

      deliveries,
    });
  } catch (error) {
    console.error("Error generating delivery report:", error);

    return res.status(500).json({
      message: "Failed to generate delivery report.",
    });
  }
});

export default Router;
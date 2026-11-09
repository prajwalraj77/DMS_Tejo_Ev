import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import Dealer from "../models/Dealer.js";
import Vehicle from "../models/Vehicle.js";
import Customer from "../models/Customer.js";
import SaleInvoice from "../models/SaleInvoice.js";
import VehicleDelivery from "../models/VehicleDelivery.js";

const Router = express.Router();

// ======================================================
// DEALER DASHBOARD
// GET /api/dashboard/dealer
// ======================================================

Router.get("/dealer", authMiddleware, async (req, res) => {
  try {
    // --------------------------------------------------
    // Only Dealers can access Dealer Dashboard
    // --------------------------------------------------

    if (req.user.role !== "DEALER") {
      return res.status(403).json({
        message: "Only dealers can access the dealer dashboard.",
      });
    }

    const dealerId = req.user.dealerId;

    if (!dealerId) {
      return res.status(400).json({
        message: "Dealer account is not properly linked.",
      });
    }

    // --------------------------------------------------
    // Verify dealer
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

    // ==================================================
    // VEHICLE COUNTS
    // ==================================================

    const [
      totalVehicles,
      pendingDealerAcceptance,
      allocatedVehicles,
      soldVehicles,
      deliveredVehicles,
    ] = await Promise.all([
      Vehicle.countDocuments({
        allocatedToType: "DEALER",
        allocatedToId: dealerId,
      }),

      Vehicle.countDocuments({
        allocatedToType: "DEALER",
        allocatedToId: dealerId,
        status: "PENDING_DEALER_ACCEPTANCE",
      }),

      Vehicle.countDocuments({
        allocatedToType: "DEALER",
        allocatedToId: dealerId,
        status: "ALLOCATED",
      }),

      Vehicle.countDocuments({
        allocatedToType: "DEALER",
        allocatedToId: dealerId,
        status: "SOLD",
      }),

      Vehicle.countDocuments({
        allocatedToType: "DEALER",
        allocatedToId: dealerId,
        status: "DELIVERED",
      }),
    ]);

    // ==================================================
    // CUSTOMER COUNT
    // ==================================================

    const totalCustomers = await Customer.countDocuments({
      dealerId: dealerId,
      isActive: true,
    });

    // ==================================================
    // SALES SUMMARY
    // ==================================================

    const salesSummary = await SaleInvoice.aggregate([
      {
        $match: {
          dealerId: dealerId,
          status: {
            $ne: "CANCELLED",
          },
        },
      },

      {
        $group: {
          _id: null,

          totalInvoices: {
            $sum: 1,
          },

          totalSales: {
            $sum: "$totalAmount",
          },

          totalPaid: {
            $sum: "$paidAmount",
          },
        },
      },
    ]);

    const sales = salesSummary[0] || {
      totalInvoices: 0,
      totalSales: 0,
      totalPaid: 0,
    };

    const totalOutstanding = Number(
      (sales.totalSales - sales.totalPaid).toFixed(2),
    );

    // ==================================================
    // PAYMENT STATUS COUNTS
    // ==================================================

    const [
      pendingPayments,
      partialPayments,
      paidInvoices,
    ] = await Promise.all([
      SaleInvoice.countDocuments({
        dealerId: dealerId,
        status: {
          $ne: "CANCELLED",
        },
        paymentStatus: "PENDING",
      }),

      SaleInvoice.countDocuments({
        dealerId: dealerId,
        status: {
          $ne: "CANCELLED",
        },
        paymentStatus: "PARTIAL",
      }),

      SaleInvoice.countDocuments({
        dealerId: dealerId,
        status: {
          $ne: "CANCELLED",
        },
        paymentStatus: "PAID",
      }),
    ]);

    // ==================================================
    // DELIVERY COUNT
    // ==================================================

    const totalDeliveries = await VehicleDelivery.countDocuments({
      dealerId: dealerId,
      status: "DELIVERED",
    });

    // ==================================================
    // RECENT SALES
    // ==================================================

    const recentSales = await SaleInvoice.find({
      dealerId: dealerId,
      status: {
        $ne: "CANCELLED",
      },
    })
      .populate("customerId")
      .populate("vehicleId")
      .sort({ createdAt: -1 })
      .limit(5);

    // ==================================================
    // RECENT DELIVERIES
    // ==================================================

    const recentDeliveries = await VehicleDelivery.find({
      dealerId: dealerId,
      status: "DELIVERED",
    })
      .populate("customerId")
      .populate("vehicleId")
      .populate("invoiceId")
      .sort({ deliveryDate: -1 })
      .limit(5);

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      dealer: {
        id: dealer._id,
        businessName: dealer.businessName,
        phone: dealer.phone,
        email: dealer.email,
        city: dealer.city,
        state: dealer.state,
        isActive: dealer.isActive,
      },

      vehicles: {
        total: totalVehicles,
        pendingDealerAcceptance,
        allocated: allocatedVehicles,
        sold: soldVehicles,
        delivered: deliveredVehicles,
      },

      customers: {
        total: totalCustomers,
      },

      sales: {
        totalInvoices: sales.totalInvoices,
        totalSales: Number(sales.totalSales.toFixed(2)),
        totalPaid: Number(sales.totalPaid.toFixed(2)),
        totalOutstanding,
      },

      payments: {
        pending: pendingPayments,
        partial: partialPayments,
        paid: paidInvoices,
      },

      deliveries: {
        total: totalDeliveries,
      },

      recentSales,

      recentDeliveries,
    });
  } catch (error) {
    console.error("Error fetching dealer dashboard:", error);

    return res.status(500).json({
      message: "Failed to fetch dealer dashboard.",
    });
  }
});

export default Router;
import mongoose from "mongoose";

const StockInwardSchema = new mongoose.Schema(
  {
    gstRate: {
      type: Number,
      required: true,
      enum: [0, 0.25, 3, 5, 12, 18, 28],
    },

    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "InventoryItem",
    },

    model: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "VehicleModel",
    },

    batteryVariant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "BatteryVariant",
    },

    colour: {
      type: String,
      required: true,
      trim: true,
    },

    chassisNumber: {
      type: String,
      required: true,
      trim: true,
    },

    motorNumber: {
      type: String,
      required: true,
      trim: true,
    },

    batteryNumber: {
      type: String,
      required: true,
      trim: true,
    },

    controllerNumber: {
      type: String,
      trim: true,
    },

    chargerNumber: {
      type: String,
      trim: true,
    },

    // Person who submitted the stock
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    submittedByRole: {
      type: String,
      required: true,
    },

    // Selected by Admin during approval
    source: {
      type: String,
      default: null,
      trim: true,
    },

    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealer",
      default: null,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const StockInward = mongoose.model("StockInward", StockInwardSchema);

export default StockInward;
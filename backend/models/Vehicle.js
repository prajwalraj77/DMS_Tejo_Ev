import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema(
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

    chassisNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    colour: {
      type: String,
      required: true,
      trim: true,
    },

    motorNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    controllerNumber: {
      type: String,
      trim: true,
    },

    batteryNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    chargerNumber: {
      type: String,
      trim: true,
    },

    stockOwner: {
      type: String,
      required: true,
      default: "TEJO EV Head Office",
      trim: true,
    },

    allocatedToType: {
      type: String,
      enum: ["HEAD_OFFICE", "DEALER", "SUB_DEALER"],
      default: "HEAD_OFFICE",
    },

    allocatedToId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealer",
      default: null,
    },

    status: {
      type: String,
      enum: ["NOT_ALLOCATED", "ALLOCATED", "SOLD"],
      default: "NOT_ALLOCATED",
    },
  },
  {
    timestamps: true,
  },
);

const Vehicle = mongoose.model("Vehicle", VehicleSchema);

export default Vehicle;

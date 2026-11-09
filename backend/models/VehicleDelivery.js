import mongoose from "mongoose";

const VehicleDeliverySchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      unique: true,
      index: true,
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SaleInvoice",
      required: true,
      unique: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealer",
      required: true,
      index: true,
    },

    deliveryDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    deliveredBy: {
      type: String,
      required: true,
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["DELIVERED", "CANCELLED"],
      default: "DELIVERED",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model(
  "VehicleDelivery",
  VehicleDeliverySchema,
);
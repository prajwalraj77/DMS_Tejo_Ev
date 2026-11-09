import mongoose from "mongoose";

const SaleInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealer",
      required: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      unique: true,
      index: true,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discountType: {
      type: String,
      enum: ["PERCENTAGE", "AMOUNT"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    taxableAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    gstRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    gstTreatment: {
      type: String,
      enum: ["INCLUDED", "EXTRA"],
      required: true,
    },

    gstAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PARTIAL", "PAID"],
      default: "PENDING",
    },

    paymentMethod: {
      type: String,
      enum: [
        "CASH",
        "UPI",
        "BANK_TRANSFER",
        "CARD",
        "CHEQUE",
        "OTHER",
        null,
      ],
      default: null,
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["DRAFT", "ISSUED", "CANCELLED"],
      default: "ISSUED",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("SaleInvoice", SaleInvoiceSchema);
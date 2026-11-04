
import mongoose from "mongoose";

const DealerSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
    },
    dealerSequence: {
      type: Number,
      unique: true,
      sparse: true,
      min: 1,
    },
    dealerCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    pincode: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Dealer = mongoose.model("Dealer", DealerSchema);

export default Dealer;

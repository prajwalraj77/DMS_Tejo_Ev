import mongoose from "mongoose";

const SubDealerSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
    },
    subDealerCode: {
      type: String,
      required: true,
      unique: true,
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
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealer",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const SubDealer = mongoose.model("SubDealer", SubDealerSchema);
export default SubDealer;

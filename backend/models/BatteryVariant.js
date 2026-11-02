import mongoose from "mongoose";

const BatteryModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },

    power: {
      type: Number,
      required: true,
    },
    range: {
      type: Number,
      required: true,
    },
    warrantyYears: {
     type: Number,
      required: true,
    },
    warrantyKm: {
     type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const BatteryVariant = mongoose.model("BatteryVariant", BatteryModelSchema);

export default BatteryVariant;
import mongoose from "mongoose";

const VehicleModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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

const VehicleModel = mongoose.model("VehicleModel", VehicleModelSchema);

export default VehicleModel;
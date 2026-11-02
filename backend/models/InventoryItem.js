import mongoose from "mongoose";

const InventoryItemSchema = new mongoose.Schema(
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

const InventoryItem = mongoose.model("InventoryItem", InventoryItemSchema);

export default InventoryItem;
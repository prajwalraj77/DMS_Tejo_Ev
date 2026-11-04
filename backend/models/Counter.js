import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      required: true,
      unique: true,
    },
    sequence: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Counter = mongoose.model("Counter", CounterSchema);

export default Counter;

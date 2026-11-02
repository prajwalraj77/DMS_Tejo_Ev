import express from "express";
const Router = express.Router();
import BatteryVariant from "../models/BatteryVariant.js";

Router.post("/", async (req, res) => {
  try {
    const { name, power, range, warrantyYears, warrantyKm } = req.body;

    const newBatteryVariant = await BatteryVariant.create({
      name,
      power,
      range,
      warrantyYears,
      warrantyKm,
    });
    res.status(200).json({
      message: "BatteryVariant  created",
      newBatteryVariant,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create BatteryVariant ",
      error: error.message,
    });
  }
});

Router.get("/", async (req, res) => {
  try {
    const allBatteryVariant = await BatteryVariant.find({});
    res.status(200).json({
      message: "List of all BatteryVariant",
      allBatteryVariant,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get List of all BatteryVariant",
      error: error.message,
    });
  }
});

export default Router;

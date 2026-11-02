import express from "express";
const Router = express.Router();
import Vehicle from "../models/Vehicle.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

Router.post("/",authMiddleware,
  permissionMiddleware("vehicles.create"), async (req, res) => {
  try {
    const {
      gstRate,
      inventoryItem,
      stockOwner,
      allocatedToType,
      allocatedToId,
      status,
      model,
      batteryVariant,
      chassisNumber,
      colour,
      motorNumber,
      controllerNumber,
      batteryNumber,
      chargerNumber,
    } = req.body;

    const newVehicle = await Vehicle.create({
      gstRate,
      inventoryItem,
      stockOwner,
      allocatedToType,
      allocatedToId,
      status,
      model,
      batteryVariant,
      chassisNumber,
      colour,
      motorNumber,
      controllerNumber,
      batteryNumber,
      chargerNumber,
    });

    res.status(200).json({
      message: "Vehicle created",
      newVehicle,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create Vehicle",
      error: error.message,
    });
  }
});
Router.get("/",authMiddleware,
  permissionMiddleware("vehicles.view"), async (req, res) => {
  try {
    const allVehicle = await Vehicle.find()
      .populate("inventoryItem", "name")
      .populate("model", "name")
      .populate("batteryVariant", "name power range warrantyYears warrantyKm")
      .populate("allocatedToId", "businessName dealerCode")

    res.status(200).json({
      message: "All Vehicle list",
      allVehicle,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to Get all Vehicle",
      error: error.message,
    });
  }
});

export default Router;

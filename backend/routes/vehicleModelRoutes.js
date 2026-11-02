import express from "express";
const Router = express.Router();
import VehicleModel from "../models/VehicleModel.js";

Router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    const newVehicleModel = await VehicleModel.create({
      name,
    });
    res.status(200).json({
      message: "VehicleModel created",
      newVehicleModel,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create VehicleModel",
      error: error.message,
    });
  }
});

Router.get("/", async(req, res) => {
  try {
    const AllVehicleModel = await VehicleModel.find({});
    res.status(200).json({
      message: "List of all Vehicle",
      AllVehicleModel,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unabel to fetch Vehicle",
      error: error.message,
    });
  }
});

export default Router;

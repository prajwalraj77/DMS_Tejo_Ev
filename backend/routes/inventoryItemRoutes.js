import express from "express";
import InventoryItem from "../models/InventoryItem.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const Router = express.Router();

Router.post("/",  authMiddleware,
  permissionMiddleware("inventory.create"),async (req, res) => {
  try {
    const { name } = req.body;

    const newInventoryItem = await InventoryItem.create({
      name,
    });
    res.status(200).json({
      message: "InventoryItem created",
      newInventoryItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create InventoryItem",
      error: error.message,
    });
  }
});

Router.get("/", authMiddleware,
  permissionMiddleware("inventory.view"), async(req, res) => {
  try {
    const AllInventoryItem = await InventoryItem.find({});
    res.status(200).json({
      message: "List of all InventoryItem",
      AllInventoryItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unabel to fetch InventoryItem",
      error: error.message,
    });
  }
});

export default Router;

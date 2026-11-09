
import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

import connectDB from "./config/database.js";
import UserRoutes from "./routes/userRoutes.js";
import DealerRoutes from "./routes/dealerRoutes.js";
import SubDealerRoutes from "./routes/subDealerRoutes.js";
import VehicleRoutes from "./routes/vehicleRoutes.js";
import VehicleModelRoutes from "./routes/vehicleModelRoutes.js";
import BatteryVariant from "./routes/batteryVariantRoutes.js";
import InventoryItemRoutes from "./routes/inventoryItemRoutes.js";
import stockInwardRoutes from "./routes/stockInwardRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import CustomerRoutes from "./routes/customerRoutes.js";
import PaymentRoutes from "./routes/paymentRoutes.js";
import VehicleDeliveryRoutes from "./routes/vehicleDeliveryRoutes.js";
import DashboardRoutes from "./routes/dashboardRoutes.js";
import ReportRoutes from "./routes/reportRoutes.js";

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Make Socket.IO available inside routes
app.set("io", io);


// Authenticate every Socket.IO connection.
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token is required"));
    }

    if (!process.env.JWT_SECRET) {
      return next(new Error("Server configuration error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.sub);

    if (!user || !user.isActive) {
      return next(new Error("User account is inactive or unavailable"));
    }

    // Verify the latest login session.
    if (
      !decoded.sessionId ||
      !user.sessionId ||
      decoded.sessionId !== user.sessionId
    ) {
      return next(new Error("SESSION_REPLACED"));
    }

    // Verify password-reset token version.
    if ((decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
      return next(new Error("TOKEN_VERSION_MISMATCH"));
    }

    socket.data.userId = user._id.toString();

    next();
  } catch (error) {
    console.error("Socket authentication failed:", error.message);
    next(new Error("Socket authentication failed"));
  }
});

// Connect authenticated users to their private user room.
io.on("connection", (socket) => {
  const userId = socket.data.userId;

  socket.join(`user:${userId}`);

  console.log("Authenticated client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});


// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "TEJO EV DMS API is running",
  });
});

// Existing API routes
app.use("/api/users", UserRoutes);
app.use("/api/dealers", DealerRoutes);
app.use("/api/sub-dealers", SubDealerRoutes);
app.use("/api/vehicles", VehicleRoutes);
app.use("/api/vehicle-models", VehicleModelRoutes);
app.use("/api/battery-variants", BatteryVariant);
app.use("/api/inventory-items", InventoryItemRoutes);
app.use("/api/stock-inwards", stockInwardRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/customers", CustomerRoutes);
app.use("/api/sale-invoices", PaymentRoutes);
app.use("/api/vehicle-deliveries", VehicleDeliveryRoutes);
app.use("/api/dashboard", DashboardRoutes);
app.use("/api/reports", ReportRoutes);


// Start server
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Port is running ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

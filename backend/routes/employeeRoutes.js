
import express from "express";
import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = express.Router();

// Fields accepted from the employee form
const employeeFields = [
  "employeeId",
  "fullName",
  "dateOfBirth",
  "gender",
  "email",
  "phone",
  "currentAddress",
  "permanentAddress",
  "designation",
  "department",
  "joiningDate",
  "employmentType",
  "workLocation",
  "reportingManager",
  "responsibilities",
  "monthlySalary",
  "annualCTC",
  "salaryComponents",
  "probationPeriod",
  "noticePeriod",
  "emergencyContactName",
  "emergencyContactPhone",
];

// CREATE employee
router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const employeeData = {};

      employeeFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          employeeData[field] = req.body[field];
        }
      });

      if (!employeeData.fullName?.trim()) {
        return res.status(400).json({
          message: "Employee full name is required",
        });
      }

      const employee = await Employee.create({
        ...employeeData,
        createdBy: req.user._id,
      });

      res.status(201).json({
        message: "Employee details saved successfully",
        employee,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "Employee ID already exists",
        });
      }

      res.status(500).json({
        message: "Failed to save employee details",
        error: error.message,
      });
    }
  }
);

// GET all employees
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const employees = await Employee.find().sort({ createdAt: -1 });

      res.status(200).json({
        message: "Employee records fetched successfully",
        count: employees.length,
        employees,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch employees",
        error: error.message,
      });
    }
  }
);

// GET one employee by MongoDB ID
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid employee ID",
        });
      }

      const employee = await Employee.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      res.status(200).json({
        message: "Employee details fetched successfully",
        employee,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch employee details",
        error: error.message,
      });
    }
  }
);

// UPDATE employee
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid employee ID",
        });
      }

      const updateData = {};

      employeeFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          message: "No valid employee fields provided for update",
        });
      }

      if (
        updateData.fullName !== undefined &&
        !updateData.fullName.trim()
      ) {
        return res.status(400).json({
          message: "Employee full name cannot be empty",
        });
      }

      const employee = await Employee.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      res.status(200).json({
        message: "Employee details updated successfully",
        employee,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "Employee ID already exists",
        });
      }

      res.status(500).json({
        message: "Failed to update employee details",
        error: error.message,
      });
    }
  }
);

// DELETE employee
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid employee ID",
        });
      }

      const employee = await Employee.findByIdAndDelete(req.params.id);

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      res.status(200).json({
        message: "Employee deleted successfully",
        employeeId: employee.employeeId,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete employee",
        error: error.message,
      });
    }
  }
);

export default router;

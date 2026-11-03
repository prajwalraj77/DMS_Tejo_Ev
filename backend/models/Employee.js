
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    // Employee identification
    employeeId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    // Personal details - Employee registration
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    motherName: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      trim: true,
    },
    maritalStatus: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
    },
    passportPhoto: {
      type: String,
      trim: true,
    },

    // Contact details
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },

    // Address details
    currentAddress: {
      type: String,
      trim: true,
    },
    permanentAddress: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pinCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },

    // Aadhaar details
    aadhaarNumber: {
      type: String,
      trim: true,
    },
    aadhaarName: {
      type: String,
      trim: true,
    },
    aadhaarVerificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED", "NOT_APPLICABLE"],
      default: "PENDING",
      trim: true,
    },

    // PAN details
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    panName: {
      type: String,
      trim: true,
    },
    panVerificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED", "NOT_APPLICABLE"],
      default: "PENDING",
      trim: true,
    },

    // Bank details
    bankAccountHolderName: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    bankAccountNumber: {
      type: String,
      trim: true,
    },
    bankIfscCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    bankBranchName: {
      type: String,
      trim: true,
    },
    bankAccountType: {
      type: String,
      trim: true,
    },

    // Emergency contact
    emergencyContactName: {
      type: String,
      trim: true,
    },
    emergencyContactRelationship: {
      type: String,
      trim: true,
    },
    emergencyContactPhone: {
      type: String,
      trim: true,
    },
    emergencyContactAlternatePhone: {
      type: String,
      trim: true,
    },

    // Employment details - HR entry
    designation: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    joiningDate: {
      type: Date,
    },
    employmentType: {
      type: String,
      trim: true,
    },
    workLocation: {
      type: String,
      trim: true,
    },
    reportingManager: {
      type: String,
      trim: true,
    },
    responsibilities: {
      type: String,
      trim: true,
    },

    // Salary details - HR entry
    monthlySalary: {
      type: Number,
      min: 0,
    },
    annualCTC: {
      type: Number,
      min: 0,
    },
    salaryComponents: {
      type: String,
      trim: true,
    },

    // Employment terms - HR entry
    probationPeriod: {
      type: String,
      default: "6 months",
      trim: true,
    },
    noticePeriod: {
      type: String,
      trim: true,
    },

    // KYC status
    kycStatus: {
      type: String,
      enum: ["PENDING", "PARTIALLY_VERIFIED", "VERIFIED", "REJECTED"],
      default: "PENDING",
      trim: true,
    },

    // Registration progress
    registrationProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedSections: {
      type: [String],
      default: [],
    },

    // Record creator
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;

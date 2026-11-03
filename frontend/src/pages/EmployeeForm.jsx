
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, LoaderCircle, UserPlus } from "lucide-react";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
  employeeId: "",
  fullName: "",
  dateOfBirth: "",
  gender: "",
  email: "",
  phone: "",
  currentAddress: "",
  permanentAddress: "",
  designation: "",
  department: "",
  joiningDate: "",
  employmentType: "",
  workLocation: "",
  reportingManager: "",
  responsibilities: "",
  monthlySalary: "",
  annualCTC: "",
  probationPeriod: "6 months",
  noticePeriod: "60 days during probation; 30 days after confirmation",
  emergencyContactName: "",
  emergencyContactPhone: "",
};

function EmployeeForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.fullName.trim().length < 2) {
      setError("Please enter a valid employee name.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        employeeId: form.employeeId.trim() || undefined,
        fullName: form.fullName.trim(),
        monthlySalary:
          form.monthlySalary === ""
            ? undefined
            : Number(form.monthlySalary),
        annualCTC:
          form.annualCTC === ""
            ? undefined
            : Number(form.annualCTC),
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === "") {
          delete payload[key];
        }
      });

      const response = await api.post("/employees", payload);

      setSuccess(
        response.data.message || "Employee details saved successfully."
      );

      setForm(initialForm);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save employee details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-[#9acb42] focus:bg-white";

  const textareaClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#9acb42] focus:bg-white";

  const renderField = (label, name, type = "text", required = false) => (
    <div key={name}>
      <label className="mb-2 block text-xs font-semibold text-gray-600">
        {label} {required && "*"}
      </label>

      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        required={required}
        min={type === "number" ? "0" : undefined}
        className={inputClass}
      />
    </div>
  );

  const renderTextarea = (label, name) => (
    <div key={name} className="md:col-span-2">
      <label className="mb-2 block text-xs font-semibold text-gray-600">
        {label}
      </label>

      <textarea
        name={name}
        value={form[name]}
        onChange={handleChange}
        rows={3}
        className={textareaClass}
      />
    </div>
  );

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-[#638d20]"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7baa27]">
          Human Resources
        </p>

        <h1 className="mt-2 text-2xl font-bold text-[#111615]">
          Employee Registration
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Enter employee information for NV EV TECH PRIVATE LIMITED.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff7df] text-[#638d20]">
            <UserPlus size={20} />
          </div>

          <div>
            <h2 className="font-bold text-[#111615]">
              Employee Information
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Fields marked with * are mandatory.
            </p>
          </div>
        </div>

        <div className="space-y-8 p-6">
          {/* Personal Details */}
          <section>
            <h3 className="mb-4 text-sm font-bold text-[#111615]">
              Personal Details
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {renderField("Employee ID", "employeeId")}
              {renderField("Full Name", "fullName", "text", true)}
              {renderField("Date of Birth", "dateOfBirth", "date")}
              {renderField("Gender", "gender")}
              {renderField("Email Address", "email", "email")}
              {renderField("Mobile Number", "phone", "tel")}
              {renderTextarea("Current Address", "currentAddress")}
              {renderTextarea("Permanent Address", "permanentAddress")}
            </div>
          </section>

          {/* Employment Details */}
          <section className="border-t border-gray-100 pt-6">
            <h3 className="mb-4 text-sm font-bold text-[#111615]">
              Employment Details
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {renderField("Designation", "designation")}
              {renderField("Department", "department")}
              {renderField("Joining Date", "joiningDate", "date")}
              {renderField("Employment Type", "employmentType")}
              {renderField("Work Location", "workLocation")}
              {renderField("Reporting Manager", "reportingManager")}
              {renderTextarea("Job Responsibilities", "responsibilities")}
            </div>
          </section>

          {/* Salary Details */}
          <section className="border-t border-gray-100 pt-6">
            <h3 className="mb-4 text-sm font-bold text-[#111615]">
              Salary Information
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {renderField(
                "Monthly Salary (₹)",
                "monthlySalary",
                "number"
              )}

              {renderField(
                "Annual Salary (₹)",
                "annualCTC",
                "number"
              )}

              <p className="text-xs text-gray-400 md:col-span-2">
                Salary is performance-based and may be reviewed according
                to company performance evaluation criteria.
              </p>
            </div>
          </section>

          {/* Employment Terms */}
          <section className="border-t border-gray-100 pt-6">
            <h3 className="mb-4 text-sm font-bold text-[#111615]">
              Employment Terms
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {renderField("Probation Period", "probationPeriod")}
              {renderField("Notice Period", "noticePeriod")}
            </div>
          </section>

          {/* Emergency Contact */}
          <section className="border-t border-gray-100 pt-6">
            <h3 className="mb-4 text-sm font-bold text-[#111615]">
              Emergency Contact
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {renderField(
                "Emergency Contact Name",
                "emergencyContactName"
              )}

              {renderField(
                "Emergency Contact Number",
                "emergencyContactPhone",
                "tel"
              )}
            </div>
          </section>
        </div>

        <div className="space-y-3 px-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-gray-100 bg-gray-50/60 px-6 py-5">
          <button
            type="submit"
            disabled={loading}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111615] px-6 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Employee Details
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeForm;

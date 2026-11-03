
import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Users,
  Plus,
  Eye,
  X,
  FileDown,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

import { generateOfferLetterPDF } from "../utils/generateOfferLetterPDF.js";

import { generateJoiningLetterPDF } from "../utils/generateJoiningLetterPDF.js";

const inputClass =
  "mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#9acb42]";

const textareaClass =
  "mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#9acb42]";

const employeeFormFields = [
  { label: "Employee ID", key: "employeeId" },
  { label: "Full Legal Name", key: "fullName" },
  { label: "Date of Birth", key: "dateOfBirth", type: "date" },
  { label: "Gender", key: "gender" },
  { label: "Personal Email", key: "email", type: "email" },
  { label: "Mobile Number", key: "phone" },
  { label: "Current Address", key: "currentAddress", type: "textarea" },
  { label: "Permanent Address", key: "permanentAddress", type: "textarea" },
  { label: "Designation", key: "designation" },
  { label: "Department", key: "department" },
  { label: "Joining Date", key: "joiningDate", type: "date" },
  { label: "Employment Type", key: "employmentType" },
  { label: "Work Location", key: "workLocation" },
  { label: "Reporting Manager", key: "reportingManager" },
  { label: "Monthly Salary (₹)", key: "monthlySalary", type: "number" },
  { label: "Annual Salary (₹)", key: "annualCTC", type: "number" },
  { label: "Probation Period", key: "probationPeriod" },
  { label: "Notice Period", key: "noticePeriod" },
  { label: "Emergency Contact Name", key: "emergencyContactName" },
  { label: "Emergency Contact Number", key: "emergencyContactPhone" },
  {
    label: "Job Responsibilities",
    key: "responsibilities",
    type: "textarea",
    full: true,
  },
];

const toDateInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
};

const createEditForm = (employee) => ({
  employeeId: employee.employeeId || "",
  fullName: employee.fullName || "",
  dateOfBirth: toDateInput(employee.dateOfBirth),
  gender: employee.gender || "",
  email: employee.email || "",
  phone: employee.phone || "",
  currentAddress: employee.currentAddress || "",
  permanentAddress: employee.permanentAddress || "",
  designation: employee.designation || "",
  department: employee.department || "",
  joiningDate: toDateInput(employee.joiningDate),
  employmentType: employee.employmentType || "",
  workLocation: employee.workLocation || "",
  reportingManager: employee.reportingManager || "",
  responsibilities: employee.responsibilities || "",
  monthlySalary: employee.monthlySalary ?? "",
  annualCTC: employee.annualCTC ?? "",
  probationPeriod: employee.probationPeriod || "6 months",
  noticePeriod:
    employee.noticePeriod ||
    "60 days during probation; 30 days after confirmation",
  emergencyContactName: employee.emergencyContactName || "",
  emergencyContactPhone: employee.emergencyContactPhone || "",
});

function EmployeeDirectory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/employees");
      setEmployees(response.data.employees || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to fetch employee records."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const formatDate = (date) => {
    if (!date) return "Not provided";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const Detail = ({ label, value }) => (
    <div className="border-b border-gray-100 py-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-gray-800">
        {value || "Not provided"}
      </p>
    </div>
  );

  const handleView = (employee) => {
    setError("");
    setSuccess("");
    setIsEditing(false);
    setSelectedEmployee(employee);
  };

  const handleEdit = (employee) => {
    setError("");
    setSuccess("");
    setSelectedEmployee(employee);
    setEditForm(createEditForm(employee));
    setIsEditing(true);
  };

  const handleEditChange = (key, value) => {
    setEditForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // UPDATE employee using PUT API
  const handleSaveChanges = async (event) => {
    event.preventDefault();

    if (!selectedEmployee?._id) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...editForm,
        dateOfBirth: editForm.dateOfBirth || null,
        joiningDate: editForm.joiningDate || null,
        monthlySalary:
          editForm.monthlySalary === ""
            ? null
            : Number(editForm.monthlySalary),
        annualCTC:
          editForm.annualCTC === ""
            ? null
            : Number(editForm.annualCTC),
      };

      const response = await api.put(
        `/employees/${selectedEmployee._id}`,
        payload
      );

      const updatedEmployee =
        response.data.employee || response.data;

      setEmployees((previous) =>
        previous.map((employee) =>
          employee._id === updatedEmployee._id
            ? updatedEmployee
            : employee
        )
      );

      setSelectedEmployee(updatedEmployee);
      setIsEditing(false);
      setSuccess("Employee details updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update employee details."
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE employee using DELETE API
  const handleDelete = async (employee) => {
    if (!employee?._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${employee.fullName} (${employee.employeeId})? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(employee._id);
      setError("");
      setSuccess("");

      await api.delete(`/employees/${employee._id}`);

      setEmployees((previous) =>
        previous.filter((item) => item._id !== employee._id)
      );

      if (selectedEmployee?._id === employee._id) {
        setSelectedEmployee(null);
        setIsEditing(false);
      }

      setSuccess(
        `${employee.fullName} has been deleted successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete employee."
      );
    } finally {
      setDeletingId("");
    }
  };

  // Generate Offer Letter or Joining Letter
  const handleGeneratePDF = async (type) => {
    if (!selectedEmployee?._id) return;

    try {
      setPdfLoading(type);
      setError("");

      const response = await api.get(
        `/employees/${selectedEmployee._id}`
      );

      const employee = response.data.employee || response.data;

      if (type === "offer") {
        await generateOfferLetterPDF(employee);
      } else if (type === "joining") {
        await generateJoiningLetterPDF(employee);
      }
    } catch (err) {
      console.error("PDF generation error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to generate PDF. Please try again."
      );
    } finally {
      setPdfLoading("");
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const value = search.toLowerCase();

    return (
      employee.fullName?.toLowerCase().includes(value) ||
      employee.employeeId?.toLowerCase().includes(value) ||
      employee.email?.toLowerCase().includes(value) ||
      employee.designation?.toLowerCase().includes(value) ||
      employee.department?.toLowerCase().includes(value)
    );
  });

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7baa27]">
            Human Resources
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[#111615]">
            Employee Directory
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage employee records stored in MongoDB.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={fetchEmployees}
            disabled={loading}
            className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard/employees/create")}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#111615] px-4 text-sm font-semibold text-white hover:bg-black"
          >
            <Plus size={16} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eff7df] text-[#638d20]">
            <Users size={22} />
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Employees</p>
            <p className="text-2xl font-bold text-[#111615]">
              {employees.length}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <Search
          size={17}
          className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employee name, ID, email, designation..."
          className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none focus:border-[#9acb42] focus:bg-white"
        />
      </div>

      {/* Error and Success Messages */}
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

      {/* Employee Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold text-[#111615]">
            Employee Records
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            Showing {filteredEmployees.length} of {employees.length} records
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-gray-50">
              <tr className="text-[11px] uppercase tracking-wider text-gray-400">
                <th className="px-5 py-4">Employee</th>
                <th className="px-5 py-4">Employee ID</th>
                <th className="px-5 py-4">Designation</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Joining Date</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-gray-400"
                  >
                    Loading employee records...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-gray-400"
                  >
                    No employee records found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-[#111615]">
                        {employee.fullName}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {employee.email || "No email"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {employee.employeeId || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {employee.designation || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {employee.department || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(employee.joiningDate)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(employee)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(employee)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(employee)}
                          disabled={deletingId === employee._id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          {deletingId === employee._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#111615]">
                  {isEditing
                    ? "Edit Employee Details"
                    : selectedEmployee.fullName}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {isEditing
                    ? "Update employee information"
                    : "Complete Employee Information"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedEmployee(null);
                  setIsEditing(false);
                  setError("");
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {isEditing ? (
              /* EDIT FORM */
              <form onSubmit={handleSaveChanges}>
                <div className="grid grid-cols-1 gap-5 px-6 py-6 md:grid-cols-2">
                  {employeeFormFields.map((field) => (
                    <div
                      key={field.key}
                      className={field.full ? "md:col-span-2" : ""}
                    >
                      <label className="text-xs font-semibold text-gray-600">
                        {field.label}
                      </label>

                      {field.type === "textarea" ? (
                        <textarea
                          value={editForm[field.key] ?? ""}
                          onChange={(e) =>
                            handleEditChange(field.key, e.target.value)
                          }
                          rows={field.key === "responsibilities" ? 5 : 3}
                          className={textareaClass}
                        />
                      ) : (
                        <input
                          type={field.type || "text"}
                          value={editForm[field.key] ?? ""}
                          onChange={(e) =>
                            handleEditChange(field.key, e.target.value)
                          }
                          min={field.type === "number" ? "0" : undefined}
                          step={field.type === "number" ? "any" : undefined}
                          className={inputClass}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm(createEditForm(selectedEmployee));
                      setIsEditing(false);
                      setError("");
                    }}
                    disabled={saving}
                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111615] px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={16} />
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW EMPLOYEE DETAILS */
              <>
                <div className="grid grid-cols-1 gap-x-8 px-6 py-4 md:grid-cols-2">
                  <Detail
                    label="Employee ID"
                    value={selectedEmployee.employeeId}
                  />
                  <Detail
                    label="Full Name"
                    value={selectedEmployee.fullName}
                  />
                  <Detail
                    label="Date of Birth"
                    value={formatDate(selectedEmployee.dateOfBirth)}
                  />
                  <Detail
                    label="Gender"
                    value={selectedEmployee.gender}
                  />
                  <Detail
                    label="Email"
                    value={selectedEmployee.email}
                  />
                  <Detail
                    label="Mobile"
                    value={selectedEmployee.phone}
                  />
                  <Detail
                    label="Current Address"
                    value={selectedEmployee.currentAddress}
                  />
                  <Detail
                    label="Permanent Address"
                    value={selectedEmployee.permanentAddress}
                  />
                  <Detail
                    label="Designation"
                    value={selectedEmployee.designation}
                  />
                  <Detail
                    label="Department"
                    value={selectedEmployee.department}
                  />
                  <Detail
                    label="Joining Date"
                    value={formatDate(selectedEmployee.joiningDate)}
                  />
                  <Detail
                    label="Employment Type"
                    value={selectedEmployee.employmentType}
                  />
                  <Detail
                    label="Work Location"
                    value={selectedEmployee.workLocation}
                  />
                  <Detail
                    label="Reporting Manager"
                    value={selectedEmployee.reportingManager}
                  />
                  <Detail
                    label="Monthly Salary"
                    value={
                      selectedEmployee.monthlySalary != null
                        ? `₹${selectedEmployee.monthlySalary}`
                        : ""
                    }
                  />
                  <Detail
                    label="Annual Salary"
                    value={
                      selectedEmployee.annualCTC != null
                        ? `₹${selectedEmployee.annualCTC}`
                        : ""
                    }
                  />
                  <Detail
                    label="Probation Period"
                    value={selectedEmployee.probationPeriod || "6 months"}
                  />
                  <Detail
                    label="Notice Period"
                    value={selectedEmployee.noticePeriod}
                  />
                  <Detail
                    label="Emergency Contact Name"
                    value={selectedEmployee.emergencyContactName}
                  />
                  <Detail
                    label="Emergency Contact Number"
                    value={selectedEmployee.emergencyContactPhone}
                  />

                  <div className="md:col-span-2">
                    <Detail
                      label="Job Responsibilities"
                      value={selectedEmployee.responsibilities}
                    />
                  </div>
                </div>

                {/* PDF Actions */}
                <div className="border-t border-gray-100 px-6 py-5">
                  <p className="mb-4 text-sm font-semibold text-[#111615]">
                    Generate Employee Documents
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => handleGeneratePDF("offer")}
                      disabled={!!pdfLoading}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#b8f34a] px-5 py-3 text-sm font-semibold text-[#111615] hover:bg-[#a5df38] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FileDown size={17} />
                      {pdfLoading === "offer"
                        ? "Generating Offer..."
                        : "Generate Offer Letter"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGeneratePDF("joining")}
                      disabled={!!pdfLoading}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#111615] px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FileDown size={17} />
                      {pdfLoading === "joining"
                        ? "Generating Joining..."
                        : "Generate Joining Letter"}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => handleEdit(selectedEmployee)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil size={16} />
                      Edit Employee
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(selectedEmployee)}
                      disabled={deletingId === selectedEmployee._id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {deletingId === selectedEmployee._id
                        ? "Deleting..."
                        : "Delete Employee"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedEmployee(null)}
                    className="mt-4 w-full rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDirectory;


import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  LockKeyhole,
  BriefcaseBusiness,
  LoaderCircle,
  Save,
} from "lucide-react";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function CreateUser() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES_EXECUTIVE",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

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

    if (form.name.trim().length < 2) {
      setError("Please enter a valid name.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      };

      const response = await api.post("/users", payload);

      setSuccess(
        response.data.message || "User created successfully."
      );

      setForm({
        name: "",
        email: "",
        password: "",
        role: "SALES_EXECUTIVE",
      });

      setTimeout(() => {
        navigate("/dashboard/users", {
          replace: true,
        });
      }, 1000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-7">

      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/dashboard/users")}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#638d20]"
        >
          <ArrowLeft size={16} />
          Back to Users
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7baa27]">
          User Management
        </p>

        <h1 className="mt-2 text-2xl font-bold text-[#111615]">
          Create New User
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create an employee account for the TEJO EV DMS.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      >
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="font-bold text-[#111615]">
            Account Information
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            Enter the user's basic account details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

          {/* Name */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600">
              Full Name *
            </label>

            <div className="relative">
              <UserRound
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                minLength={2}
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none focus:border-[#9acb42] focus:bg-white"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600">
              Email Address *
            </label>

            <div className="relative">
              <Mail
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="employee@tejoev.com"
                required
                autoComplete="email"
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none focus:border-[#9acb42] focus:bg-white"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600">
              Initial Password *
            </label>

            <div className="relative">
              <LockKeyhole
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none focus:border-[#9acb42] focus:bg-white"
              />
            </div>

            <p className="mt-1.5 text-[11px] text-gray-400">
              Minimum 8 characters.
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600">
              User Role *
            </label>

            <div className="relative">
              <BriefcaseBusiness
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none focus:border-[#9acb42] focus:bg-white"
              >
                <option value="SALES_EXECUTIVE">
                  Sales Executive
                </option>

                <option value="HR">
                  HR
                </option>
              </select>
            </div>
          </div>

        </div>

        {/* Messages */}
        <div className="px-6">
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

        {/* Actions */}
        <div className="mt-5 flex flex-col-reverse justify-end gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-5 sm:flex-row">

          <button
            type="button"
            onClick={() => navigate("/dashboard/users")}
            className="h-11 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111615] px-6 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save size={16} />
                Create User
              </>
            )}
          </button>

        </div>
      </form>
    </div>
  );
}

export default CreateUser;

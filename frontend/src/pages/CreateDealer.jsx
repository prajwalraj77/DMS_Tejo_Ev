
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  KeyRound,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "../services/api.js";

const INITIAL_FORM = {
  businessName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  password: "",
};

function CreateDealer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setApiError("");
    setSuccessMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required.";
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required.";
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Enter a valid 6-digit PIN code.";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setApiError("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        businessName: formData.businessName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        password: formData.password,
      };

      const response = await api.post("/dealers", payload);

      setSuccessMessage(
        response.data?.message || "Dealer created successfully."
      );

      setFormData({ ...INITIAL_FORM });
      setErrors({});
      setShowPassword(false);
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 401) {
        setApiError(
          "Your session may have expired. Please sign in again and retry."
        );
      } else if (status === 403) {
        setApiError(
          "You do not have permission to create dealers. Please sign in with an administrator account."
        );
      } else {
        setApiError(
          message ||
            "Unable to create the dealer. Check your connection and try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...INITIAL_FORM });
    setErrors({});
    setApiError("");
    setSuccessMessage("");
    setShowPassword(false);
  };

  const inputClass = (field) =>
    `w-full rounded-xl border ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-200 focus:border-emerald-600 focus:ring-emerald-100"
    } bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50`;

  const FieldLabel = ({ children, required }) => (
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );

  const FieldError = ({ field }) =>
    errors[field] ? (
      <p className="mt-1.5 text-xs text-red-600">{errors[field]}</p>
    ) : null;

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Page heading */}
        <div className="mb-7">
          <button
            type="button"
            onClick={() => navigate("/dashboard/dealers")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
          >
            <ArrowLeft size={17} />
            Back to Dealer Network
          </button>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Dealer Management
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create New Dealer
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Register a dealership and prepare its account access.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 sm:self-auto">
              <ShieldCheck size={19} className="text-emerald-700" />
              <span className="text-xs font-semibold text-emerald-800">
                Admin Registration
              </span>
            </div>
          </div>
        </div>

        {/* Success and API error messages */}
        {successMessage && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">{successMessage}</p>
              <p className="mt-1">
                The form has been cleared. You can create another dealer or
                return to the Dealer Network to verify the record.
              </p>
              <button
                type="button"
                onClick={() => navigate("/dashboard/dealers")}
                className="mt-3 font-semibold underline underline-offset-4"
              >
                View Dealer Network
              </button>
            </div>
          </div>
        )}

        {apiError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Dealer creation failed</p>
              <p className="mt-1">{apiError}</p>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mb-6 grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {[
            { number: "01", label: "Business Details" },
            { number: "02", label: "Address" },
            { number: "03", label: "Account Access" },
          ].map((step, index) => (
            <div
              key={step.number}
              className={`flex items-center gap-2 border-b-2 px-3 py-4 sm:gap-3 sm:px-5 ${
                index === 0
                  ? "border-emerald-600 bg-emerald-50/50"
                  : "border-transparent"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  index === 0
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {step.number}
              </span>

              <span
                className={`text-xs font-semibold sm:text-sm ${
                  index === 0 ? "text-emerald-800" : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Business information */}
          <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Building2 size={22} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Business Information
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Enter the dealership's official contact details.
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              <div className="sm:col-span-2">
                <FieldLabel required>Business / Dealer Name</FieldLabel>
                <input
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={inputClass("businessName")}
                  placeholder="e.g. Tejo EV Bengaluru"
                  autoComplete="organization"
                  disabled={isSubmitting}
                />
                <FieldError field="businessName" />
              </div>

              <div>
                <FieldLabel required>Mobile Number</FieldLabel>
                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    className={`${inputClass("phone")} pl-10`}
                    placeholder="10-digit mobile number"
                    autoComplete="tel-national"
                    disabled={isSubmitting}
                  />
                </div>
                <FieldError field="phone" />
              </div>

              <div>
                <FieldLabel required>Email Address</FieldLabel>
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${inputClass("email")} pl-10`}
                    placeholder="dealer@example.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>
                <FieldError field="email" />
              </div>
            </div>
          </section>

          {/* Address information */}
          <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <MapPin size={22} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Address Information
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Provide the dealership's registered address.
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              <div className="sm:col-span-2">
                <FieldLabel required>Street / Business Address</FieldLabel>
                <textarea
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className={`${inputClass("address")} resize-y`}
                  placeholder="Building, street, area and landmark"
                  autoComplete="street-address"
                  disabled={isSubmitting}
                />
                <FieldError field="address" />
              </div>

              <div>
                <FieldLabel required>City</FieldLabel>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClass("city")}
                  placeholder="e.g. Bengaluru"
                  autoComplete="address-level2"
                  disabled={isSubmitting}
                />
                <FieldError field="city" />
              </div>

              <div>
                <FieldLabel required>State</FieldLabel>
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={inputClass("state")}
                  placeholder="e.g. Karnataka"
                  autoComplete="address-level1"
                  disabled={isSubmitting}
                />
                <FieldError field="state" />
              </div>

              <div>
                <FieldLabel required>PIN Code</FieldLabel>
                <input
                  name="pincode"
                  inputMode="numeric"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  className={inputClass("pincode")}
                  placeholder="6-digit PIN code"
                  autoComplete="postal-code"
                  disabled={isSubmitting}
                />
                <FieldError field="pincode" />
              </div>
            </div>
          </section>

          {/* Account access */}
          <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <KeyRound size={22} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Dealer Account Access
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Set an initial password for the dealer login.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="max-w-xl">
                <FieldLabel required>Initial Password</FieldLabel>

                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`${inputClass("password")} pr-12`}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <FieldError field="password" />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Use at least 8 characters. Choose a secure password and
                  share it with the dealer through a secure channel.
                </p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="mb-8 flex flex-col-reverse justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RotateCcw size={17} />
              Clear Form
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/dashboard/dealers")}
                disabled={isSubmitting}
                className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />
                {isSubmitting ? "Creating Dealer..." : "Create Dealer"}
              </button>
            </div>
          </div>

          <p className="mb-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <CheckCircle2 size={15} />
            Required fields are marked with an asterisk.
          </p>
        </form>
      </div>
    </div>
  );
}

export default CreateDealer;


import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Save,
  RotateCcw,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Store,
} from "lucide-react";
import api from "../services/api.js";

const EMPTY_FORM = {
  businessName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

function EditSubDealer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [originalData, setOriginalData] = useState(EMPTY_FORM);
  const [subDealerCode, setSubDealerCode] = useState("");
  const [parentDealer, setParentDealer] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let cancelled = false;

    const loadSubDealer = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get("/sub-dealers");
        const subDealers = response.data?.subDealers || [];
        const subDealer = subDealers.find((item) => item._id === id);

        if (!subDealer) {
          if (!cancelled) {
            setError(
              "Sub-dealer not found. It may be unavailable in the sub-dealer list."
            );
          }
          return;
        }

        const values = {
          businessName: subDealer.businessName || "",
          phone: subDealer.phone || "",
          email: subDealer.email || "",
          address: subDealer.address || "",
          city: subDealer.city || "",
          state: subDealer.state || "",
          pincode: String(subDealer.pincode || ""),
        };

        if (!cancelled) {
          setFormData(values);
          setOriginalData(values);
          setSubDealerCode(subDealer.subDealerCode || "");
          setParentDealer(subDealer.dealerId || null);
          setIsActive(Boolean(subDealer.isActive));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load sub-dealer details. Please try again."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadSubDealer();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setError("");
    setNotice("");
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.businessName.trim()) {
      nextErrors.businessName = "Business name is required.";
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      nextErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.address.trim()) {
      nextErrors.address = "Address is required.";
    }

    if (!formData.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!formData.state.trim()) {
      nextErrors.state = "State is required.";
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      nextErrors.pincode = "Enter a valid 6-digit PIN code.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleReset = () => {
    setFormData({ ...originalData });
    setFieldErrors({});
    setError("");
    setNotice("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!validateForm()) return;

    try {
      setIsSaving(true);

      const payload = {
        businessName: formData.businessName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      };

      const response = await api.put(`/sub-dealers/${id}`, payload);
      const updated = response.data?.subDealer;

      const savedValues = {
        businessName: updated?.businessName ?? payload.businessName,
        phone: updated?.phone ?? payload.phone,
        email: updated?.email ?? payload.email,
        address: updated?.address ?? payload.address,
        city: updated?.city ?? payload.city,
        state: updated?.state ?? payload.state,
        pincode: String(updated?.pincode ?? payload.pincode),
      };

      setFormData(savedValues);
      setOriginalData(savedValues);
      setSubDealerCode(updated?.subDealerCode || subDealerCode);

      setNotice(
        response.data?.message ||
          "Sub-dealer details updated successfully."
      );
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 401) {
        setError("Your session may have expired. Please sign in again.");
      } else if (status === 403) {
        setError("You do not have permission to edit sub-dealer details.");
      } else {
        setError(
          message || "Unable to update sub-dealer details. Please try again."
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-xl border ${
      fieldErrors[field]
        ? "border-red-400 focus:ring-red-100"
        : "border-slate-200 focus:border-emerald-600 focus:ring-emerald-100"
    } bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4`;

  const FieldLabel = ({ children, required }) => (
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );

  const FieldError = ({ field }) =>
    fieldErrors[field] ? (
      <p className="mt-1.5 text-xs text-red-600">{fieldErrors[field]}</p>
    ) : null;

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center bg-slate-50 p-8">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <LoaderCircle className="animate-spin" size={22} />
          Loading sub-dealer details...
        </div>
      </div>
    );
  }

  if (error && !subDealerCode) {
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 text-red-600" size={22} />
            <div>
              <h1 className="font-bold text-slate-900">
                Unable to open sub-dealer
              </h1>
              <p className="mt-2 text-sm text-slate-600">{error}</p>
              <button
                type="button"
                onClick={() => navigate("/dashboard/sub-dealers")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                <ArrowLeft size={16} />
                Back to Sub-Dealer Network
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard/sub-dealers")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
        >
          <ArrowLeft size={17} />
          Back to Sub-Dealer Network
        </button>

        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Sub-Dealer Management
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Edit Sub-Dealer
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review and update the sub-dealership's registered information.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
            <ShieldCheck size={19} className="text-emerald-700" />
            <span className="text-xs font-semibold text-emerald-800">
              Admin Management
            </span>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sub-Dealer Code
            </p>
            <p className="mt-2 break-words text-xl font-bold text-slate-900">
              {subDealerCode}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Existing identifier
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Parent Dealer
            </p>
            <p className="mt-2 break-words font-bold text-slate-900">
              {parentDealer?.businessName || "No parent dealer linked"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Parent relationship is not editable here.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current Status
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isActive ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              <span className="font-semibold text-slate-800">
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Status can be managed from the network page.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Store size={22} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">
                  Business Information
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Update the sub-dealer's business and contact details.
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              <div className="sm:col-span-2">
                <FieldLabel required>Business / Sub-Dealer Name</FieldLabel>
                <input
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={inputClass("businessName")}
                  placeholder="Sub-dealer business name"
                  disabled={isSaving}
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
                    disabled={isSaving}
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
                    placeholder="subdealer@example.com"
                    disabled={isSaving}
                  />
                </div>
                <FieldError field="email" />
              </div>
            </div>
          </section>

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
                  Update the registered sub-dealership address.
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
                  disabled={isSaving}
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
                  placeholder="City"
                  disabled={isSaving}
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
                  placeholder="State"
                  disabled={isSaving}
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
                  disabled={isSaving}
                />
                <FieldError field="pincode" />
              </div>
            </div>
          </section>

          <div className="mb-8 flex flex-col-reverse justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RotateCcw size={17} />
              Reset Changes
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/dashboard/sub-dealers")}
                disabled={isSaving}
                className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSubDealer;

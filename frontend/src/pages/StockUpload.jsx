
import { useEffect, useState } from "react";
import {
  Percent,
  Package,
  Bike,
  Battery,
  Palette,
  ScanLine,
  Settings2,
  Zap,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";
import api from "../services/api.js";


const INITIAL_FORM = {
  gstRate: "",
  inventoryItem: "",
  model: "",
  batteryVariant: "",
  colour: "",
  chassisNumber: "",
  motorNumber: "",
  batteryNumber: "",
  controllerNumber: "",
  chargerNumber: "",
};

function FieldLabel({ children, required = false }) {
  return (
    <label className="mb-2 block text-[12px] font-semibold tracking-wide text-black/65">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

function InputField({
  label,
  placeholder,
  icon: Icon,
  required = false,
  value,
  onChange,
  error,
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>

      <div className="group relative">
        <Icon
          size={16}
          strokeWidth={1.8}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition ${
            error
              ? "text-red-400"
              : "text-black/25 group-focus-within:text-[#7baa27]"
          }`}
        />

        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`h-11 w-full rounded-lg border bg-[#fafbf9] pl-10 pr-4 text-sm text-[#111615] outline-none transition-all placeholder:text-black/30 hover:border-black/[0.14] focus:bg-white focus:ring-4 ${
            error
              ? "border-red-400 focus:border-red-400 focus:ring-red-100"
              : "border-black/[0.08] focus:border-[#8fca32] focus:ring-[#b8f34a]/10"
          }`}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

function SelectField({
  label,
  icon: Icon,
  children,
  required = false,
  value,
  onChange,
  error,
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>

      <div className="relative">
        <Icon
          size={16}
          strokeWidth={1.8}
          className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${
            error ? "text-red-400" : "text-black/25"
          }`}
        />

        <select
          value={value}
          onChange={onChange}
          className={`h-11 w-full appearance-none rounded-lg border bg-[#fafbf9] pl-10 pr-10 text-sm text-[#111615] outline-none transition-all hover:border-black/[0.14] focus:bg-white focus:ring-4 ${
            error
              ? "border-red-400 focus:border-red-400 focus:ring-red-100"
              : "border-black/[0.08] focus:border-[#8fca32] focus:ring-[#b8f34a]/10"
          }`}
        >
          {children}
        </select>

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/30">
          ↓
        </span>
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

function SectionHeader({ number, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#111615] text-[11px] font-bold text-[#b8f34a]">
        {number}
      </div>

      <div>
        <h2 className="text-[15px] font-bold text-[#111615]">
          {title}
        </h2>
        <p className="mt-1 text-[12px] text-black/40">
          {description}
        </p>
      </div>
    </div>
  );
}

function StockUpload() {
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [vehicleModels, setVehicleModels] = useState([]);
  const [batteryVariants, setBatteryVariants] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [modelsResponse, batteriesResponse, itemsResponse] =
          await Promise.all([
             api.get("/vehicle-models"),
    api.get("/battery-variants"),
    api.get("/inventory-items"),
          ]);

        setVehicleModels(
          modelsResponse.data.AllVehicleModel || []
        );

        setBatteryVariants(
          batteriesResponse.data.allBatteryVariant || []
        );

        setInventoryItems(
          itemsResponse.data.AllInventoryItem || []
        );
      } catch (error) {
        console.error("Failed to load stock upload dropdowns:", error);

        setNotice({
          type: "error",
          message:
            "Unable to load the vehicle dropdown options. Please check the backend and refresh the page.",
        });
      }
    };

    fetchDropdownData();
  }, []);

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setNotice({
      type: "",
      message: "",
    });
  };

  const validateForm = () => {
    const requiredFields = {
      gstRate: "GST Rate",
      inventoryItem: "Inventory Item",
      model: "Vehicle Model",
      batteryVariant: "Battery Variant",
      colour: "Colour",
      chassisNumber: "Chassis Number",
      motorNumber: "Motor Number",
      batteryNumber: "Battery Number",
    };

    const validationErrors = {};

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!String(formData[field] ?? "").trim()) {
        validationErrors[field] = `${label} is required`;
      }
    });

    return validationErrors;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setNotice({
        type: "error",
        message: "Please complete all required fields before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    setNotice({
      type: "",
      message: "",
    });

    try {
      const payload = {
  gstRate: Number(formData.gstRate),
  inventoryItem: formData.inventoryItem,
  model: formData.model,
  batteryVariant: formData.batteryVariant,
  colour: formData.colour.trim(),
  chassisNumber: formData.chassisNumber.trim(),
  motorNumber: formData.motorNumber.trim(),
  batteryNumber: formData.batteryNumber.trim(),
  controllerNumber: formData.controllerNumber.trim(),
  chargerNumber: formData.chargerNumber.trim(),
};

      const response = await api.post("/stock-inwards", payload);

      setNotice({
        type: "success",
        message:
          response.data.message ||
          "Stock submitted successfully for administrator approval.",
      });

      setFormData({ ...INITIAL_FORM });
      setErrors({});
    } catch (error) {
      console.error("Stock submission failed:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to submit stock. Please check the entered details and try again.";

      setNotice({
        type: "error",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1180px] pb-10">
      {/* Page heading */}
      <div className="mb-7">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7baa27]">
          Stock & Transfers
        </p>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#111615]">
              Stock Upload / Inward
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
              Add a vehicle to the inventory and submit the stock entry
              for administrator approval.
            </p>
          </div>

          <div className="rounded-full border border-black/[0.07] bg-white px-3 py-1.5 text-[11px] font-medium text-black/45">
            New Stock Entry
          </div>
        </div>
      </div>

      {/* Main form */}
      <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_12px_40px_rgba(17,22,21,0.05)]">
        {/* Vehicle Information */}
        <section className="p-6 sm:p-8">
          <SectionHeader
            number="01"
            title="Vehicle Information"
            description="Basic vehicle and inventory details."
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <SelectField
              label="GST Rate"
              icon={Percent}
              required
              value={formData.gstRate}
              onChange={handleChange("gstRate")}
              error={errors.gstRate}
            >
              <option value="">Select GST Rate</option>
              <option value="0">0%</option>
              <option value="0.25">0.25%</option>
              <option value="3">3%</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
            </SelectField>

            <SelectField
              label="Inventory Item"
              icon={Package}
              required
              value={formData.inventoryItem}
              onChange={handleChange("inventoryItem")}
              error={errors.inventoryItem}
            >
              <option value="">Select Inventory Item</option>
              {inventoryItems.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Vehicle Model"
              icon={Bike}
              required
              value={formData.model}
              onChange={handleChange("model")}
              error={errors.model}
            >
              <option value="">Select Vehicle Model</option>
              {vehicleModels.map((model) => (
                <option key={model._id} value={model._id}>
                  {model.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Battery Variant"
              icon={Battery}
              required
              value={formData.batteryVariant}
              onChange={handleChange("batteryVariant")}
              error={errors.batteryVariant}
            >
              <option value="">Select Battery Variant</option>
              {batteryVariants.map((battery) => (
                <option key={battery._id} value={battery._id}>
                  {battery.name}
                  {battery.power ? ` · ${battery.power}` : ""}
                  {battery.range ? ` · ${battery.range} km range` : ""}
                  {battery.warrantyYears
                    ? ` · ${battery.warrantyYears} yr warranty`
                    : ""}
                  {battery.warrantyKm
                    ? ` / ${battery.warrantyKm} km`
                    : ""}
                </option>
              ))}
            </SelectField>

            <InputField
              label="Colour"
              placeholder="Enter vehicle colour"
              icon={Palette}
              required
              value={formData.colour}
              onChange={handleChange("colour")}
              error={errors.colour}
            />

            <InputField
              label="Chassis Number"
              placeholder="Enter chassis / VIN number"
              icon={ScanLine}
              required
              value={formData.chassisNumber}
              onChange={handleChange("chassisNumber")}
              error={errors.chassisNumber}
            />
          </div>
        </section>

        <div className="border-t border-black/[0.06]" />

        {/* Component Identification */}
        <section className="p-6 sm:p-8">
          <SectionHeader
            number="02"
            title="Component Identification"
            description="Record the vehicle's component serial numbers."
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <InputField
              label="Motor Number"
              placeholder="Enter motor number"
              icon={Settings2}
              required
              value={formData.motorNumber}
              onChange={handleChange("motorNumber")}
              error={errors.motorNumber}
            />

            <InputField
              label="Battery Number"
              placeholder="Enter battery number"
              icon={Battery}
              required
              value={formData.batteryNumber}
              onChange={handleChange("batteryNumber")}
              error={errors.batteryNumber}
            />

            <InputField
              label="Controller Number"
              placeholder="Enter controller number"
              icon={Settings2}
              value={formData.controllerNumber}
              onChange={handleChange("controllerNumber")}
            />

            <InputField
              label="Charger Number"
              placeholder="Enter charger number"
              icon={Zap}
              value={formData.chargerNumber}
              onChange={handleChange("chargerNumber")}
            />
          </div>
        </section>

        <div className="border-t border-black/[0.06]" />

        {/* Submission message */}
        {notice.message && (
          <div
            role="status"
            className={`mx-5 mt-5 flex items-start gap-3 rounded-xl border p-4 sm:mx-8 ${
              notice.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
            )}

            <p className="text-sm leading-5">{notice.message}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col justify-between gap-4 border-t border-black/[0.06] bg-white p-5 sm:flex-row sm:items-center sm:px-8">
          <div>
            <p className="text-[12px] font-semibold text-black/60">
              Ready to submit?
            </p>

            <p className="mt-0.5 text-[11px] text-black/35">
              Stock remains pending until approved by an administrator.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Save Draft will be implemented separately later */}
            <button
              type="button"
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-black/[0.09] bg-white px-5 text-[12px] font-semibold text-black/60 transition-all hover:border-black/15 hover:bg-[#fafbf9] hover:text-black"
            >
              <Save size={15} />
              Save Draft
            </button>

            <button
              onClick={handleSubmit}
              type="button"
              disabled={isSubmitting}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#111615] px-5 text-[12px] font-semibold text-white transition-all hover:bg-black hover:shadow-lg hover:shadow-black/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={15} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Submit for Approval
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockUpload;

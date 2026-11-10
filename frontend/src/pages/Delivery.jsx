import { useEffect, useMemo, useState } from "react";
import {
  Bike,
  CheckCircle2,
  ClipboardCheck,
  RefreshCw,
  Search,
  UserRound,
  X,
  AlertCircle,
} from "lucide-react";
import api from "../services/api.js";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function Delivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveredBy, setDeliveredBy] = useState("");
  const [remarks, setRemarks] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [deliveryResponse, invoiceResponse] = await Promise.all([
        api.get("/vehicle-deliveries"),
        api.get("/sale-invoices"),
      ]);

      setDeliveries(deliveryResponse.data?.deliveries || []);
      setInvoices(invoiceResponse.data?.invoices || []);
    } catch (err) {
      console.error("Failed to load delivery data:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load delivery data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingDeliveries = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          invoice.status === "ISSUED" &&
          invoice.paymentStatus === "PAID" &&
          invoice.vehicleId?.status === "SOLD",
      ),
    [invoices],
  );

  const filteredDeliveries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return deliveries.filter((delivery) =>
      [
        delivery.invoiceId?.invoiceNumber,
        delivery.customerId?.name,
        delivery.customerId?.phone,
        delivery.vehicleId?.chassisNumber,
        delivery.vehicleId?.motorNumber,
        delivery.deliveredBy,
        delivery.status,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query),
      ),
    );
  }, [deliveries, search]);

  const openForm = (invoice) => {
    setError("");
    setNotice("");
    setSelectedInvoice(invoice);
    setDeliveryDate(new Date().toISOString().slice(0, 16));
    setDeliveredBy("");
    setRemarks("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (formLoading) return;
    setShowForm(false);
    setSelectedInvoice(null);
    setDeliveryDate("");
    setDeliveredBy("");
    setRemarks("");
  };

  const handleCreateDelivery = async (event) => {
    event.preventDefault();

    if (!selectedInvoice) return;

    setFormLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await api.post("/vehicle-deliveries", {
        invoiceId: selectedInvoice._id,
        vehicleId: selectedInvoice.vehicleId._id,
        deliveryDate: deliveryDate
          ? new Date(deliveryDate).toISOString()
          : new Date().toISOString(),
        deliveredBy: deliveredBy.trim(),
        remarks: remarks.trim(),
      });

      if (response.data?.delivery) {
        setDeliveries((previous) => [
          response.data.delivery,
          ...previous,
        ]);
      }

      setInvoices((previous) =>
        previous.map((invoice) =>
          invoice._id === selectedInvoice._id
            ? {
                ...invoice,
                vehicleId: {
                  ...invoice.vehicleId,
                  status: "DELIVERED",
                },
              }
            : invoice,
        ),
      );

      setNotice(
        response.data?.message || "Vehicle delivered successfully.",
      );
      closeForm();
      fetchData();
    } catch (err) {
      console.error("Failed to create delivery:", err);
      setError(
        err.response?.data?.message ||
          "Unable to record vehicle delivery.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-7 pb-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8fca32]">
            Delivery Management
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#111615]">
            Vehicle Delivery
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
            Deliver fully paid vehicles to customers and keep the vehicle
            lifecycle updated through SOLD → DELIVERED.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={loading || formLoading}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#111615] hover:bg-black/[0.03] disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {notice && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">{notice}</div>
          <button type="button" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button type="button" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Ready for Delivery"
          value={pendingDeliveries.length}
          icon={<ClipboardCheck size={19} />}
        />
        <SummaryCard
          label="Delivered Vehicles"
          value={deliveries.filter((item) => item.status === "DELIVERED").length}
          icon={<CheckCircle2 size={19} />}
        />
        <SummaryCard
          label="Delivered Value"
          value={money(
            deliveries.reduce(
              (sum, item) =>
                sum + Number(item.invoiceId?.totalAmount || 0),
              0,
            ),
          )}
          icon={<Bike size={19} />}
        />
      </div>

      {pendingDeliveries.length > 0 && (
        <div className="rounded-2xl border border-[#b8f34a]/50 bg-[#b8f34a]/10 p-5">
          <div className="mb-4">
            <h2 className="font-bold text-[#111615]">
              Vehicles Ready for Delivery
            </h2>
            <p className="mt-1 text-xs text-black/45">
              Only issued, fully paid invoices with SOLD vehicles are shown.
            </p>
          </div>

          <div className="space-y-3">
            {pendingDeliveries.map((invoice) => (
              <div
                key={invoice._id}
                className="flex flex-col gap-4 rounded-xl border border-black/[0.06] bg-white p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="grid flex-1 gap-4 sm:grid-cols-3">
                  <Info
                    icon={<ClipboardCheck size={15} />}
                    label="Invoice"
                    value={invoice.invoiceNumber}
                  />
                  <Info
                    icon={<UserRound size={15} />}
                    label="Customer"
                    value={invoice.customerId?.name || "—"}
                    sub={invoice.customerId?.phone}
                  />
                  <Info
                    icon={<Bike size={15} />}
                    label="Vehicle"
                    value={invoice.vehicleId?.model?.name || "Vehicle"}
                    sub={invoice.vehicleId?.chassisNumber}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 lg:justify-end">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wide text-black/35">
                      Paid
                    </p>
                    <p className="font-bold text-emerald-700">
                      {money(invoice.paidAmount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openForm(invoice)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#111615] px-4 py-2.5 text-xs font-semibold text-white hover:bg-black"
                  >
                    <CheckCircle2 size={15} />
                    Record Delivery
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-black/[0.07] bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search invoice, customer, phone, chassis..."
            className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#fafbf9] pl-11 pr-4 text-sm text-[#111615] outline-none focus:border-[#8fca32]"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-sm">
        <div className="border-b border-black/[0.06] px-5 py-4">
          <h2 className="font-bold text-[#111615]">Delivery History</h2>
          <p className="mt-1 text-xs text-black/40">
            {filteredDeliveries.length} delivery
            {filteredDeliveries.length === 1 ? "" : "ies"} found
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-black/45">
            <RefreshCw size={19} className="animate-spin" />
            Loading delivery data...
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Bike size={35} className="mx-auto text-black/20" />
            <h3 className="mt-4 font-semibold text-[#111615]">
              No deliveries found
            </h3>
            <p className="mt-1 text-sm text-black/45">
              Completed vehicle deliveries will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-[#f8f9f6] text-xs uppercase tracking-wide text-black/45">
                <tr>
                  <th className="px-5 py-4">Invoice</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Vehicle</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Delivered By</th>
                  <th className="px-5 py-4">Delivery Date</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/[0.05]">
                {filteredDeliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-[#fafbf8]">
                    <td className="px-5 py-4 font-semibold text-[#111615]">
                      {delivery.invoiceId?.invoiceNumber || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-[#111615]">
                        {delivery.customerId?.name || "—"}
                      </p>
                      <p className="mt-1 text-xs text-black/40">
                        {delivery.customerId?.phone || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-[#111615]">
                        {delivery.vehicleId?.model?.name || "Vehicle"}
                      </p>
                      <p className="mt-1 text-xs text-black/40">
                        {delivery.vehicleId?.chassisNumber || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold text-[#111615]">
                      {money(delivery.invoiceId?.totalAmount)}
                    </td>

                    <td className="px-5 py-4 text-black/60">
                      {delivery.deliveredBy || "—"}
                    </td>

                    <td className="px-5 py-4 text-black/60">
                      {delivery.deliveryDate
                        ? new Date(delivery.deliveryDate).toLocaleString(
                            "en-IN",
                          )
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {delivery.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.06] bg-white px-6 py-5">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8fca32]">
                  Delivery Confirmation
                </p>
                <h2 className="text-xl font-bold text-[#111615]">
                  Record Vehicle Delivery
                </h2>
                <p className="mt-1 text-xs text-black/40">
                  {selectedInvoice.invoiceNumber} ·{" "}
                  {selectedInvoice.customerId?.name || "Customer"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={formLoading}
                className="rounded-lg p-2 text-black/40 hover:bg-black/[0.04]"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateDelivery}
              className="space-y-5 p-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard
                  label="Vehicle"
                  value={selectedInvoice.vehicleId?.model?.name || "Vehicle"}
                  sub={
                    selectedInvoice.vehicleId?.batteryVariant?.name +
                    " · " +
                    (selectedInvoice.vehicleId?.colour || "Colour not set")
                  }
                />
                <InfoCard
                  label="Chassis Number"
                  value={selectedInvoice.vehicleId?.chassisNumber || "—"}
                  sub={"Invoice total: " + money(selectedInvoice.totalAmount)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Delivery Date & Time" required>
                  <input
                    type="datetime-local"
                    value={deliveryDate}
                    onChange={(event) => setDeliveryDate(event.target.value)}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="Delivered By" required>
                  <input
                    type="text"
                    value={deliveredBy}
                    onChange={(event) => setDeliveredBy(event.target.value)}
                    required
                    maxLength={100}
                    className={inputClass}
                    placeholder="Enter staff / executive name"
                  />
                </Field>
              </div>

              <Field label="Remarks">
                <textarea
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-xl border border-black/[0.08] bg-white px-3 py-3 text-sm text-[#111615] outline-none focus:border-[#8fca32] focus:ring-4 focus:ring-[#b8f34a]/10"
                  placeholder="Optional delivery remarks"
                />
              </Field>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                This action will mark the vehicle as <strong>DELIVERED</strong>.
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={formLoading}
                  className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-semibold text-[#111615] hover:bg-black/[0.03]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading || !deliveredBy.trim()}
                  className="flex items-center gap-2 rounded-xl bg-[#111615] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {formLoading && (
                    <RefreshCw size={15} className="animate-spin" />
                  )}
                  {formLoading ? "Recording..." : "Confirm Delivery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-black/50">{label}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b8f34a]/25 text-[#456b0c]">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold text-[#111615]">{value}</p>
    </div>
  );
}

function Info({ icon, label, value, sub }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 text-black/30">{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-wide text-black/35">
          {label}
        </p>
        <p className="mt-1 font-semibold text-[#111615]">{value}</p>
        {sub && <p className="mt-1 text-xs text-black/40">{sub}</p>}
      </div>
    </div>
  );
}

function InfoCard({ label, value, sub }) {
  return (
    <div className="rounded-xl bg-[#f8f9f6] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-black/35">
        {label}
      </p>
      <p className="mt-2 font-semibold text-[#111615]">{value}</p>
      {sub && <p className="mt-1 text-xs text-black/45">{sub}</p>}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-black/55">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm text-[#111615] outline-none focus:border-[#8fca32] focus:ring-4 focus:ring-[#b8f34a]/10";

export default Delivery;


import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  Download,
  IndianRupee,
  UserRound,
  Bike,
  X,
  AlertCircle,
  CheckCircle2,
  HandCoins,
} from "lucide-react";
import api from "../services/api.js";

const initialForm = {
  customerId: "",
  vehicleId: "",
  sellingPrice: "",
  discountType: "PERCENTAGE",
  discountValue: "0",
  gstRate: "5",
  gstTreatment: "EXTRA",
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState(null);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [invoiceResponse, customerResponse, vehicleResponse] =
        await Promise.all([
          api.get("/sale-invoices"),
          api.get("/customers"),
          api.get("/vehicles"),
        ]);

      setInvoices(invoiceResponse.data?.invoices || []);
      setCustomers(customerResponse.data?.customers || []);

      const dealerVehicles = (vehicleResponse.data?.allVehicle || []).filter(
        (vehicle) =>
          vehicle.allocatedToType === "DEALER" &&
          vehicle.status === "ALLOCATED",
      );

      setVehicles(dealerVehicles);
    } catch (err) {
      console.error("Failed to load billing data:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load billing data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) =>
      [
        invoice.invoiceNumber,
        invoice.customerId?.name,
        invoice.customerId?.phone,
        invoice.vehicleId?.chassisNumber,
        invoice.vehicleId?.motorNumber,
        invoice.paymentStatus,
        invoice.status,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query),
      ),
    );
  }, [invoices, search]);

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle._id === form.vehicleId,
  );

  const selectedCustomer = customers.find(
    (customer) => customer._id === form.customerId,
  );

  const calculated = useMemo(() => {
    const sellingPrice = Number(form.sellingPrice || 0);
    const discountValue = Number(form.discountValue || 0);
    const discountAmount =
      form.discountType === "PERCENTAGE"
        ? (sellingPrice * discountValue) / 100
        : discountValue;

    const afterDiscount = Math.max(0, sellingPrice - discountAmount);
    const gstRate = Number(form.gstRate || 0);

    if (form.gstTreatment === "INCLUDED") {
      const total = afterDiscount;
      const taxable = gstRate === 0 ? total : total / (1 + gstRate / 100);
      return {
        discountAmount,
        taxableAmount: taxable,
        gstAmount: total - taxable,
        totalAmount: total,
      };
    }

    const gstAmount = (afterDiscount * gstRate) / 100;

    return {
      discountAmount,
      taxableAmount: afterDiscount,
      gstAmount,
      totalAmount: afterDiscount + gstAmount,
    };
  }, [form]);

  const handleCreateInvoice = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        customerId: form.customerId,
        vehicleId: form.vehicleId,
        sellingPrice: Number(form.sellingPrice),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        gstRate: Number(form.gstRate),
        gstTreatment: form.gstTreatment,
      };

      const response = await api.post("/sale-invoices", payload);

      setInvoices((previous) => [
        response.data.invoice,
        ...previous,
      ]);

      setVehicles((previous) =>
        previous.filter((vehicle) => vehicle._id !== form.vehicleId),
      );

      setForm(initialForm);
      setShowForm(false);
      setNotice(
        response.data?.message || "Sale invoice created successfully.",
      );
    } catch (err) {
      console.error("Failed to create invoice:", err);
      setError(
        err.response?.data?.message ||
          "Unable to create sale invoice.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const downloadInvoice = async (invoiceId, invoiceNumber) => {
    setPdfLoadingId(invoiceId);
    setError("");

    try {
      const response = await api.get(
        "/sale-invoices/" + invoiceId + "/print",
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = (invoiceNumber || "sale-invoice") + ".pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download invoice:", err);
      setError(
        err.response?.data?.message ||
          "Unable to download invoice PDF.",
      );
    } finally {
      setPdfLoadingId(null);
    }
  };

  const closeForm = () => {
    if (formLoading) return;
    setShowForm(false);
    setForm(initialForm);
  };

  const openPayment = (invoice) => {
    setError("");
    setNotice("");
    setPaymentInvoice(invoice);
    setPaymentAmount(
      Math.max(
        0,
        Number(invoice.totalAmount || 0) -
          Number(invoice.paidAmount || 0),
      ).toFixed(2),
    );
    setPaymentMethod(invoice.paymentMethod || "UPI");
  };

  const closePayment = () => {
    if (paymentLoading) return;
    setPaymentInvoice(null);
    setPaymentAmount("");
    setPaymentMethod("UPI");
  };

  const handleCollectPayment = async (event) => {
    event.preventDefault();

    if (!paymentInvoice) return;

    const amount = Number(paymentAmount || 0);
    const outstanding = Math.max(
      0,
      Number(paymentInvoice.totalAmount || 0) -
        Number(paymentInvoice.paidAmount || 0),
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Payment amount must be greater than ₹0.");
      return;
    }

    if (amount > outstanding) {
      setError(
        "Payment amount cannot be greater than the outstanding balance.",
      );
      return;
    }

    setPaymentLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await api.patch(
        "/sale-invoices/" + paymentInvoice._id + "/payment",
        {
          amount,
          paymentMethod,
        },
      );

      const updatedInvoice = response.data?.invoice;

      if (updatedInvoice) {
        setInvoices((previous) =>
          previous.map((invoice) =>
            invoice._id === updatedInvoice._id
              ? updatedInvoice
              : invoice,
          ),
        );
      }

      setNotice(
        response.data?.message || "Payment recorded successfully.",
      );
      closePayment();
      fetchData();
    } catch (err) {
      console.error("Failed to collect payment:", err);
      setError(
        err.response?.data?.message ||
          "Unable to collect payment. Please try again.",
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="space-y-7 pb-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8fca32]">
            Sales Management
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#111615]">
            Billing & Sale Invoices
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
            Create dealer sale invoices, calculate GST at billing time, and
            download printable PDF invoices.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading || formLoading}
            className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#111615] hover:bg-black/[0.03] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex h-11 items-center gap-2 rounded-xl bg-[#111615] px-4 text-sm font-semibold text-white hover:bg-black"
          >
            <Plus size={17} />
            Create Sale Invoice
          </button>
        </div>
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
          label="Total Invoices"
          value={invoices.length}
          icon={<FileText size={19} />}
        />
        <SummaryCard
          label="Paid Invoices"
          value={invoices.filter((item) => item.paymentStatus === "PAID").length}
          icon={<CheckCircle2 size={19} />}
        />
        <SummaryCard
          label="Outstanding"
          value={money(
            invoices.reduce(
              (sum, invoice) =>
                sum +
                Math.max(
                  0,
                  Number(invoice.totalAmount || 0) -
                    Number(invoice.paidAmount || 0),
                ),
              0,
            ),
          )}
          icon={<IndianRupee size={19} />}
        />
      </div>

      <div className="rounded-2xl border border-black/[0.07] bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search invoice number, customer, phone, chassis..."
            className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#fafbf9] pl-11 pr-4 text-sm text-[#111615] outline-none focus:border-[#8fca32]"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-sm">
        <div className="border-b border-black/[0.06] px-5 py-4">
          <h2 className="font-bold text-[#111615]">Sale Invoices</h2>
          <p className="mt-1 text-xs text-black/40">
            {filteredInvoices.length} invoice
            {filteredInvoices.length === 1 ? "" : "s"} found
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-black/45">
            <RefreshCw size={19} className="animate-spin" />
            Loading billing data...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FileText size={35} className="mx-auto text-black/20" />
            <h3 className="mt-4 font-semibold text-[#111615]">
              No sale invoices found
            </h3>
            <p className="mt-1 text-sm text-black/45">
              Create your first sale invoice to start billing.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-[#f8f9f6] text-xs uppercase tracking-wide text-black/45">
                <tr>
                  <th className="px-5 py-4">Invoice</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Vehicle</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Paid</th>
                  <th className="px-5 py-4">Outstanding</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">PDF</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/[0.05]">
                {filteredInvoices.map((invoice) => {
                  const outstanding = Math.max(
                    0,
                    Number(invoice.totalAmount || 0) -
                      Number(invoice.paidAmount || 0),
                  );

                  return (
                    <tr key={invoice._id} className="hover:bg-[#fafbf8]">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#111615]">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="mt-1 text-xs text-black/40">
                          {invoice.createdAt
                            ? new Date(invoice.createdAt).toLocaleDateString(
                                "en-IN",
                              )
                            : "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <UserRound size={15} className="text-black/30" />
                          <div>
                            <p className="font-medium text-[#111615]">
                              {invoice.customerId?.name || "—"}
                            </p>
                            <p className="mt-1 text-xs text-black/40">
                              {invoice.customerId?.phone || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Bike size={15} className="text-black/30" />
                          <div>
                            <p className="font-medium text-[#111615]">
                              {invoice.vehicleId?.model?.name || "Vehicle"}
                            </p>
                            <p className="mt-1 text-xs text-black/40">
                              {invoice.vehicleId?.chassisNumber || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-[#111615]">
                        {money(invoice.totalAmount)}
                      </td>

                      <td className="px-5 py-4 text-emerald-700">
                        {money(invoice.paidAmount)}
                      </td>

                      <td className="px-5 py-4 font-semibold text-orange-700">
                        {money(outstanding)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold " +
                            (invoice.paymentStatus === "PAID"
                              ? "bg-emerald-50 text-emerald-700"
                              : invoice.paymentStatus === "PARTIAL"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-orange-50 text-orange-700")
                          }
                        >
                          {invoice.paymentStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {invoice.paymentStatus === "PAID" ? (
                          <span className="text-xs font-semibold text-emerald-700">
                            Fully Paid
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openPayment(invoice)}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#111615] px-3 py-2 text-xs font-semibold text-white hover:bg-black"
                          >
                            <HandCoins size={14} />
                            Collect Payment
                          </button>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            downloadInvoice(
                              invoice._id,
                              invoice.invoiceNumber,
                            )
                          }
                          disabled={pdfLoadingId === invoice._id}
                          className="inline-flex items-center gap-2 rounded-lg border border-black/[0.08] px-3 py-2 text-xs font-semibold text-[#111615] hover:border-[#8fca32] hover:bg-[#b8f34a]/10 disabled:opacity-50"
                        >
                          {pdfLoadingId === invoice._id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <Download size={14} />
                          )}
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {paymentInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8fca32]">
                  Payment Collection
                </p>
                <h2 className="text-xl font-bold text-[#111615]">
                  {paymentInvoice.invoiceNumber}
                </h2>
                <p className="mt-1 text-xs text-black/40">
                  {paymentInvoice.customerId?.name || "Customer"} ·{" "}
                  {paymentInvoice.customerId?.phone || "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={closePayment}
                disabled={paymentLoading}
                className="rounded-lg p-2 text-black/40 hover:bg-black/[0.04]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCollectPayment} className="space-y-5 p-6">
              <div className="grid grid-cols-3 gap-3">
                <BalanceCard
                  label="Invoice Total"
                  value={money(paymentInvoice.totalAmount)}
                />
                <BalanceCard
                  label="Already Paid"
                  value={money(paymentInvoice.paidAmount)}
                />
                <BalanceCard
                  label="Outstanding"
                  value={money(
                    Math.max(
                      0,
                      Number(paymentInvoice.totalAmount || 0) -
                        Number(paymentInvoice.paidAmount || 0),
                    ),
                  )}
                />
              </div>

              <Field label="Payment Amount (₹)" required>
                <input
                  type="number"
                  min="0.01"
                  max={Math.max(
                    0,
                    Number(paymentInvoice.totalAmount || 0) -
                      Number(paymentInvoice.paidAmount || 0),
                  )}
                  step="0.01"
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(event.target.value)}
                  required
                  className={inputClass}
                  placeholder="Enter amount received"
                />
              </Field>

              <Field label="Payment Method" required>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Card</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="OTHER">Other</option>
                </select>
              </Field>

              <div className="rounded-xl border border-[#b8f34a]/40 bg-[#b8f34a]/10 p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-black/55">Remaining after payment</span>
                  <span className="font-bold text-[#111615]">
                    {money(
                      Math.max(
                        0,
                        Number(paymentInvoice.totalAmount || 0) -
                          Number(paymentInvoice.paidAmount || 0) -
                          Number(paymentAmount || 0),
                      ),
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closePayment}
                  disabled={paymentLoading}
                  className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-semibold text-[#111615] hover:bg-black/[0.03]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading || !paymentAmount}
                  className="flex items-center gap-2 rounded-xl bg-[#111615] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paymentLoading && (
                    <RefreshCw size={15} className="animate-spin" />
                  )}
                  {paymentLoading ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.06] bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#111615]">
                  Create Sale Invoice
                </h2>
                <p className="mt-1 text-xs text-black/40">
                  Backend will recalculate and validate all invoice totals.
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

            <form onSubmit={handleCreateInvoice} className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Customer" required>
                  <select
                    value={form.customerId}
                    onChange={(event) =>
                      updateForm("customerId", event.target.value)
                    }
                    required
                    className={inputClass}
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} — {customer.phone}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Vehicle" required>
                  <select
                    value={form.vehicleId}
                    onChange={(event) =>
                      updateForm("vehicleId", event.target.value)
                    }
                    required
                    className={inputClass}
                  >
                    <option value="">Select allocated vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.model?.name || "Vehicle"} —{" "}
                        {vehicle.chassisNumber}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {selectedCustomer && (
                <div className="rounded-xl bg-[#f8f9f6] p-4 text-xs text-black/55">
                  <span className="font-semibold text-[#111615]">
                    Customer:
                  </span>{" "}
                  {selectedCustomer.name} · {selectedCustomer.phone} ·{" "}
                  {selectedCustomer.email}
                </div>
              )}

              {selectedVehicle && (
                <div className="rounded-xl bg-[#f8f9f6] p-4 text-xs text-black/55">
                  <span className="font-semibold text-[#111615]">
                    Vehicle:
                  </span>{" "}
                  {selectedVehicle.model?.name || "—"} ·{" "}
                  {selectedVehicle.batteryVariant?.name || "—"} ·{" "}
                  {selectedVehicle.colour || "—"} · Chassis:{" "}
                  {selectedVehicle.chassisNumber}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Selling Price (₹)" required>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sellingPrice}
                    onChange={(event) =>
                      updateForm("sellingPrice", event.target.value)
                    }
                    required
                    className={inputClass}
                    placeholder="Enter negotiated selling price"
                  />
                </Field>

                <Field label="Discount Type" required>
                  <select
                    value={form.discountType}
                    onChange={(event) =>
                      updateForm("discountType", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </Field>

                <Field
                  label={
                    form.discountType === "PERCENTAGE"
                      ? "Discount (%)"
                      : "Discount Amount (₹)"
                  }
                  required
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discountValue}
                    onChange={(event) =>
                      updateForm("discountValue", event.target.value)
                    }
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="GST Rate" required>
                  <select
                    value={form.gstRate}
                    onChange={(event) =>
                      updateForm("gstRate", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="0">0%</option>
                    <option value="0.25">0.25%</option>
                    <option value="3">3%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </Field>

                <Field label="GST Treatment" required>
                  <select
                    value={form.gstTreatment}
                    onChange={(event) =>
                      updateForm("gstTreatment", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="EXTRA">GST Extra</option>
                    <option value="INCLUDED">GST Included</option>
                  </select>
                </Field>
              </div>

              <div className="rounded-2xl border border-black/[0.07] bg-[#f8f9f6] p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-black/40">
                  Invoice Preview
                </p>

                <div className="space-y-2 text-sm">
                  <PriceRow
                    label="Selling Price"
                    value={money(form.sellingPrice)}
                  />
                  <PriceRow
                    label="Discount"
                    value={"- " + money(calculated.discountAmount)}
                  />
                  <PriceRow
                    label="Taxable Amount"
                    value={money(calculated.taxableAmount)}
                  />
                  <PriceRow
                    label={"GST (" + form.gstRate + "% — " + form.gstTreatment + ")"}
                    value={money(calculated.gstAmount)}
                  />
                  <div className="mt-3 border-t border-black/10 pt-3">
                    <PriceRow
                      label="Final Invoice Total"
                      value={money(calculated.totalAmount)}
                      strong
                    />
                  </div>
                </div>
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
                  disabled={
                    formLoading ||
                    !form.customerId ||
                    !form.vehicleId ||
                    !form.sellingPrice
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#111615] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {formLoading && (
                    <RefreshCw size={15} className="animate-spin" />
                  )}
                  {formLoading ? "Creating..." : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BalanceCard({ label, value }) {
  return (
    <div className="rounded-xl bg-[#f8f9f6] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-black/35">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-[#111615]">{value}</p>
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

function PriceRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={strong ? "font-bold text-[#111615]" : "text-black/55"}>
        {label}
      </span>
      <span
        className={
          strong
            ? "font-bold text-[#111615]"
            : "font-medium text-[#111615]"
        }
      >
        {value}
      </span>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm text-[#111615] outline-none focus:border-[#8fca32] focus:ring-4 focus:ring-[#b8f34a]/10";

export default Billing;

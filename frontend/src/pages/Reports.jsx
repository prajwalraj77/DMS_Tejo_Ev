import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  CalendarDays,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
  IndianRupee,
} from "lucide-react";
import api from "../services/api.js";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const csvEscape = (value) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

function Reports() {
  const [reportType, setReportType] = useState("sales");
  const [sales, setSales] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [deliveries, setDeliveries] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    paymentStatus: "",
    invoiceNumber: "",
    inventoryStatus: "",
    deliveryStatus: "",
  });

  const loadReport = async () => {
    setLoading(true);
    setError("");

    try {
      if (reportType === "sales") {
        const params = {};
        if (filters.fromDate) params.fromDate = filters.fromDate;
        if (filters.toDate) params.toDate = filters.toDate;
        if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
        if (filters.invoiceNumber.trim()) {
          params.invoiceNumber = filters.invoiceNumber.trim();
        }

        const response = await api.get("/reports/sales", { params });
        setSales(response.data);
      } else if (reportType === "inventory") {
        const params = {};
        if (filters.inventoryStatus) params.status = filters.inventoryStatus;

        const response = await api.get("/reports/inventory", { params });
        setInventory(response.data);
      } else {
        const params = {};
        if (filters.fromDate) params.fromDate = filters.fromDate;
        if (filters.toDate) params.toDate = filters.toDate;
        if (filters.deliveryStatus) params.status = filters.deliveryStatus;

        const response = await api.get("/reports/deliveries", { params });
        setDeliveries(response.data);
      }
    } catch (err) {
      console.error("Failed to load report:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load the report. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportType]);

  const salesRows = sales?.invoices || [];
  const inventoryRows = inventory?.vehicles || [];
  const deliveryRows = deliveries?.deliveries || [];

  const visibleSalesRows = useMemo(() => {
    const query = filters.invoiceNumber.trim().toLowerCase();
    if (!query) return salesRows;

    return salesRows.filter((invoice) =>
      [
        invoice.invoiceNumber,
        invoice.customerId?.name,
        invoice.customerId?.phone,
        invoice.vehicleId?.chassisNumber,
      ].some((value) => String(value || "").toLowerCase().includes(query)),
    );
  }, [salesRows, filters.invoiceNumber]);

  const downloadCsv = () => {
    let headers = [];
    let rows = [];

    if (reportType === "sales") {
      headers = [
        "Invoice Number",
        "Date",
        "Customer",
        "Phone",
        "Chassis Number",
        "Selling Price",
        "Discount",
        "Taxable Amount",
        "GST",
        "Total",
        "Paid",
        "Outstanding",
        "Payment Status",
      ];

      rows = visibleSalesRows.map((invoice) => {
        const total = Number(invoice.totalAmount || 0);
        const paid = Number(invoice.paidAmount || 0);

        return [
          invoice.invoiceNumber,
          formatDate(invoice.createdAt),
          invoice.customerId?.name,
          invoice.customerId?.phone,
          invoice.vehicleId?.chassisNumber,
          invoice.sellingPrice,
          invoice.discountAmount,
          invoice.taxableAmount,
          invoice.gstAmount,
          total,
          paid,
          Math.max(0, total - paid),
          invoice.paymentStatus,
        ];
      });
    } else if (reportType === "inventory") {
      headers = [
        "Chassis Number",
        "Motor Number",
        "Battery Number",
        "Model",
        "Variant",
        "Colour",
        "Status",
      ];

      rows = inventoryRows.map((vehicle) => [
        vehicle.chassisNumber,
        vehicle.motorNumber,
        vehicle.batteryNumber,
        vehicle.model?.name,
        vehicle.batteryVariant?.name,
        vehicle.colour,
        vehicle.status,
      ]);
    } else {
      headers = [
        "Invoice Number",
        "Delivery Date",
        "Customer",
        "Phone",
        "Chassis Number",
        "Delivered By",
        "Total",
        "Paid",
        "Payment Status",
        "Status",
      ];

      rows = deliveryRows.map((delivery) => [
        delivery.invoiceId?.invoiceNumber,
        formatDate(delivery.deliveryDate),
        delivery.customerId?.name,
        delivery.customerId?.phone,
        delivery.vehicleId?.chassisNumber,
        delivery.deliveredBy,
        delivery.invoiceId?.totalAmount,
        delivery.invoiceId?.paidAmount,
        delivery.invoiceId?.paymentStatus,
        delivery.status,
      ]);
    }

    const csv = [
      headers.map(csvEscape).join(","),
      ...rows.map((row) => row.map(csvEscape).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `tejo-${reportType}-report.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      paymentStatus: "",
      invoiceNumber: "",
      inventoryStatus: "",
      deliveryStatus: "",
    });
  };

  const salesSummary = sales?.summary || {};
  const inventorySummary = inventory?.summary || {};
  const deliverySummary = deliveries?.summary || {};

  return (
    <div className="space-y-7 pb-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8fca32]">
            Business Intelligence
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#111615]">
            Reports
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
            Review sales, inventory and vehicle delivery performance from the
            dealer account.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={clearFilters}
            className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#111615] hover:bg-black/[0.03]"
          >
            Clear Filters
          </button>
          <button
            type="button"
            onClick={loadReport}
            disabled={loading}
            className="flex h-11 items-center gap-2 rounded-xl bg-[#111615] px-4 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <ReportTab
          active={reportType === "sales"}
          icon={<BarChart3 size={18} />}
          label="Sales Report"
          onClick={() => setReportType("sales")}
        />
        <ReportTab
          active={reportType === "inventory"}
          icon={<Boxes size={18} />}
          label="Inventory Report"
          onClick={() => setReportType("inventory")}
        />
        <ReportTab
          active={reportType === "deliveries"}
          icon={<Truck size={18} />}
          label="Delivery Report"
          onClick={() => setReportType("deliveries")}
        />
      </div>

      <div className="rounded-2xl border border-black/[0.07] bg-white p-4 shadow-sm">
        {reportType === "sales" && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <DateInput
              label="From Date"
              value={filters.fromDate}
              onChange={(value) =>
                setFilters((p) => ({ ...p, fromDate: value }))
              }
            />
            <DateInput
              label="To Date"
              value={filters.toDate}
              onChange={(value) =>
                setFilters((p) => ({ ...p, toDate: value }))
              }
            />
            <SelectInput
              label="Payment Status"
              value={filters.paymentStatus}
              onChange={(value) =>
                setFilters((p) => ({ ...p, paymentStatus: value }))
              }
              options={[
                ["", "All Payments"],
                ["PENDING", "Pending"],
                ["PARTIAL", "Partial"],
                ["PAID", "Paid"],
              ]}
            />
            <TextInput
              label="Invoice / Customer Search"
              value={filters.invoiceNumber}
              onChange={(value) =>
                setFilters((p) => ({ ...p, invoiceNumber: value }))
              }
              placeholder="Invoice number, customer, phone..."
            />
          </div>
        )}

        {reportType === "inventory" && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <SelectInput
              label="Inventory Status"
              value={filters.inventoryStatus}
              onChange={(value) =>
                setFilters((p) => ({ ...p, inventoryStatus: value }))
              }
              options={[
                ["", "All Statuses"],
                ["PENDING_DEALER_ACCEPTANCE", "Pending Acceptance"],
                ["ALLOCATED", "Allocated"],
                ["SOLD", "Sold"],
                ["DELIVERED", "Delivered"],
              ]}
            />
          </div>
        )}

        {reportType === "deliveries" && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <DateInput
              label="From Date"
              value={filters.fromDate}
              onChange={(value) =>
                setFilters((p) => ({ ...p, fromDate: value }))
              }
            />
            <DateInput
              label="To Date"
              value={filters.toDate}
              onChange={(value) =>
                setFilters((p) => ({ ...p, toDate: value }))
              }
            />
            <SelectInput
              label="Delivery Status"
              value={filters.deliveryStatus}
              onChange={(value) =>
                setFilters((p) => ({ ...p, deliveryStatus: value }))
              }
              options={[
                ["", "Delivered"],
                ["DELIVERED", "Delivered"],
                ["CANCELLED", "Cancelled"],
              ]}
            />
          </div>
        )}

        <div className="mt-4 flex flex-col justify-between gap-3 border-t border-black/[0.06] pt-4 sm:flex-row sm:items-center">
          <p className="text-xs text-black/40">
            Filters are applied by the backend and the current report can be
            exported as CSV.
          </p>
          <button
            type="button"
            onClick={loadReport}
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-black/10 bg-[#fafbf9] px-4 text-xs font-bold text-[#111615] hover:bg-black/[0.03] disabled:opacity-50"
          >
            <Search size={15} />
            Apply Filters
          </button>
        </div>
      </div>

      {reportType === "sales" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Invoices" value={salesSummary.totalInvoices || 0} icon={<BarChart3 size={18} />} />
            <Metric label="Total Sales" value={money(salesSummary.totalSales)} icon={<IndianRupee size={18} />} />
            <Metric label="Paid" value={money(salesSummary.totalPaid)} icon={<CheckCircle2 size={18} />} />
            <Metric label="Outstanding" value={money(salesSummary.totalOutstanding)} icon={<IndianRupee size={18} />} />
          </div>

          <ReportTable
            title="Sales Transactions"
            count={visibleSalesRows.length}
            exportLabel="Export CSV"
            onExport={downloadCsv}
          >
            <table className="min-w-[1100px] w-full text-left">
              <thead>
                <tr className="border-b border-black/[0.07] text-[10px] uppercase tracking-[0.15em] text-black/35">
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-right">Paid</th>
                  <th className="px-5 py-3 text-right">Outstanding</th>
                  <th className="px-5 py-3">Payment</th>
                </tr>
              </thead>
              <tbody>
                {visibleSalesRows.map((invoice) => {
                  const total = Number(invoice.totalAmount || 0);
                  const paid = Number(invoice.paidAmount || 0);

                  return (
                    <tr key={invoice._id} className="border-b border-black/[0.05] text-sm last:border-0">
                      <td className="px-5 py-4 font-semibold text-[#111615]">{invoice.invoiceNumber}</td>
                      <td className="px-5 py-4 text-black/50">{formatDate(invoice.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="font-medium">{invoice.customerId?.name || "—"}</div>
                        <div className="text-xs text-black/35">{invoice.customerId?.phone || "—"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div>{invoice.vehicleId?.model?.name || "—"}</div>
                        <div className="text-xs text-black/35">{invoice.vehicleId?.chassisNumber || "—"}</div>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold">{money(total)}</td>
                      <td className="px-5 py-4 text-right">{money(paid)}</td>
                      <td className="px-5 py-4 text-right">{money(Math.max(0, total - paid))}</td>
                      <td className="px-5 py-4"><StatusBadge value={invoice.paymentStatus} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {visibleSalesRows.length === 0 && <EmptyState />}
          </ReportTable>
        </>
      )}

      {reportType === "inventory" && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Metric label="Total" value={inventorySummary.total || 0} icon={<Boxes size={18} />} />
            <Metric label="Pending" value={inventorySummary.pendingDealerAcceptance || 0} icon={<PackageCheck size={18} />} />
            <Metric label="Allocated" value={inventorySummary.allocated || 0} icon={<Boxes size={18} />} />
            <Metric label="Sold" value={inventorySummary.sold || 0} icon={<IndianRupee size={18} />} />
            <Metric label="Delivered" value={inventorySummary.delivered || 0} icon={<Truck size={18} />} />
          </div>

          <ReportTable
            title="Inventory"
            count={inventoryRows.length}
            exportLabel="Export CSV"
            onExport={downloadCsv}
          >
            <table className="min-w-[950px] w-full text-left">
              <thead>
                <tr className="border-b border-black/[0.07] text-[10px] uppercase tracking-[0.15em] text-black/35">
                  <th className="px-5 py-3">Chassis</th>
                  <th className="px-5 py-3">Motor</th>
                  <th className="px-5 py-3">Battery</th>
                  <th className="px-5 py-3">Model</th>
                  <th className="px-5 py-3">Variant</th>
                  <th className="px-5 py-3">Colour</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryRows.map((vehicle) => (
                  <tr key={vehicle._id} className="border-b border-black/[0.05] text-sm last:border-0">
                    <td className="px-5 py-4 font-semibold">{vehicle.chassisNumber || "—"}</td>
                    <td className="px-5 py-4 text-black/55">{vehicle.motorNumber || "—"}</td>
                    <td className="px-5 py-4 text-black/55">{vehicle.batteryNumber || "—"}</td>
                    <td className="px-5 py-4">{vehicle.model?.name || "—"}</td>
                    <td className="px-5 py-4">{vehicle.batteryVariant?.name || "—"}</td>
                    <td className="px-5 py-4">{vehicle.colour || "—"}</td>
                    <td className="px-5 py-4"><StatusBadge value={vehicle.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inventoryRows.length === 0 && <EmptyState />}
          </ReportTable>
        </>
      )}

      {reportType === "deliveries" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Metric label="Total Deliveries" value={deliverySummary.totalDeliveries || 0} icon={<Truck size={18} />} />
            <Metric label="Delivered" value={deliveryRows.filter((item) => item.status === "DELIVERED").length} icon={<CheckCircle2 size={18} />} />
            <Metric label="Total Collected" value={money(deliveryRows.reduce((sum, item) => sum + Number(item.invoiceId?.paidAmount || 0), 0))} icon={<IndianRupee size={18} />} />
          </div>

          <ReportTable
            title="Vehicle Deliveries"
            count={deliveryRows.length}
            exportLabel="Export CSV"
            onExport={downloadCsv}
          >
            <table className="min-w-[1050px] w-full text-left">
              <thead>
                <tr className="border-b border-black/[0.07] text-[10px] uppercase tracking-[0.15em] text-black/35">
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Delivery Date</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3">Delivered By</th>
                  <th className="px-5 py-3 text-right">Invoice Total</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveryRows.map((delivery) => (
                  <tr key={delivery._id} className="border-b border-black/[0.05] text-sm last:border-0">
                    <td className="px-5 py-4 font-semibold">{delivery.invoiceId?.invoiceNumber || "—"}</td>
                    <td className="px-5 py-4 text-black/50">{formatDate(delivery.deliveryDate)}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{delivery.customerId?.name || "—"}</div>
                      <div className="text-xs text-black/35">{delivery.customerId?.phone || "—"}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div>{delivery.vehicleId?.model?.name || "—"}</div>
                      <div className="text-xs text-black/35">{delivery.vehicleId?.chassisNumber || "—"}</div>
                    </td>
                    <td className="px-5 py-4">{delivery.deliveredBy || "—"}</td>
                    <td className="px-5 py-4 text-right font-semibold">{money(delivery.invoiceId?.totalAmount)}</td>
                    <td className="px-5 py-4"><StatusBadge value={delivery.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {deliveryRows.length === 0 && <EmptyState />}
          </ReportTable>
        </>
      )}
    </div>
  );
}

function ReportTab({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
        active
          ? "border-[#b8f34a] bg-[#b8f34a]/20 text-[#111615]"
          : "border-black/[0.07] bg-white text-black/50 hover:bg-black/[0.02]"
      }`}
    >
      <span className={active ? "text-[#6f9c1e]" : "text-black/35"}>{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

function Metric({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#b8f34a]/20 text-[#6f9c1e]">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-black/35">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#111615]">{value}</p>
    </div>
  );
}

function DateInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-black/35">{label}</span>
      <div className="relative">
        <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/25" />
        <input
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafbf9] pl-9 pr-3 text-sm outline-none focus:border-[#8fca32]"
        />
      </div>
    </label>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-black/35">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafbf9] px-3 text-sm outline-none focus:border-[#8fca32]"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-black/35">{label}</span>
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/25" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafbf9] pl-9 pr-3 text-sm outline-none focus:border-[#8fca32]"
        />
      </div>
    </label>
  );
}

function ReportTable({ title, count, exportLabel, onExport, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-black/[0.07] px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-bold text-[#111615]">{title}</h2>
          <p className="mt-1 text-xs text-black/35">{count} record{count === 1 ? "" : "s"}</p>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="flex h-9 items-center justify-center gap-2 rounded-lg border border-black/10 bg-[#fafbf9] px-3 text-xs font-bold text-[#111615] hover:bg-black/[0.03]"
        >
          <Download size={14} />
          {exportLabel}
        </button>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function StatusBadge({ value }) {
  const label = String(value || "UNKNOWN").replaceAll("_", " ");
  const positive = ["PAID", "DELIVERED", "ALLOCATED", "SOLD"].includes(value);
  const warning = ["PARTIAL", "PENDING", "PENDING_DEALER_ACCEPTANCE"].includes(value);

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
        positive
          ? "bg-emerald-50 text-emerald-700"
          : warning
            ? "bg-amber-50 text-amber-700"
            : "bg-black/[0.05] text-black/45"
      }`}
    >
      {label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-12 text-center">
      <FileSpreadsheet className="mx-auto text-black/20" size={28} />
      <p className="mt-3 text-sm font-semibold text-black/50">No records found</p>
      <p className="mt-1 text-xs text-black/30">Try changing the selected filters.</p>
    </div>
  );
}

export default Reports;

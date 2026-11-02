
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Building2,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Users,
  X,
  ChevronRight,
  Power,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

function DealerNetwork() {
  const navigate = useNavigate();

  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingDealerId, setUpdatingDealerId] = useState(null);

  const fetchDealers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/dealers/all");
      setDealers(
        response.data?.allDealers ||
          response.data?.dealers ||
          []
      );
    } catch (err) {
      console.error("Failed to load dealers:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load dealers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const filteredDealers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return dealers.filter((dealer) => {
      const matchesSearch = [
        dealer.businessName,
        dealer.dealerCode,
        dealer.email,
        dealer.phone,
        dealer.city,
        dealer.state,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && dealer.isActive !== false) ||
        (statusFilter === "INACTIVE" && dealer.isActive === false);

      return matchesSearch && matchesStatus;
    });
  }, [dealers, search, statusFilter]);

  const activeCount = dealers.filter(
    (dealer) => dealer.isActive !== false
  ).length;

  const inactiveCount = dealers.filter(
    (dealer) => dealer.isActive === false
  ).length;

  const handleToggleStatus = async (dealer) => {
    if (updatingDealerId) return;

    const nextStatus = dealer.isActive === false;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus ? "activate" : "deactivate"
      } "${dealer.businessName}" (${dealer.dealerCode})?`
    );

    if (!confirmed) return;

    setUpdatingDealerId(dealer._id);
    setError("");
    setNotice("");

    try {
      const response = await api.patch(
        `/dealers/${dealer._id}/status`,
        { isActive: nextStatus }
      );

      // Update the displayed dealer immediately.
      setDealers((previous) =>
        previous.map((item) =>
          item._id === dealer._id
            ? { ...item, isActive: nextStatus }
            : item
        )
      );

      setNotice(
        response.data?.message ||
          `Dealer ${nextStatus ? "activated" : "deactivated"} successfully.`
      );

      // Reload authoritative data from the backend.
      try {
        const refreshResponse = await api.get("/dealers/all");
        setDealers(
          refreshResponse.data?.allDealers ||
            refreshResponse.data?.dealers ||
            []
        );
      } catch {
        // Keep the locally updated status if refreshing fails.
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update dealer status. Please try again."
      );
    } finally {
      setUpdatingDealerId(null);
    }
  };

  return (
    <div className="space-y-7 pb-10">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8fca32]">
            Network Management
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#111615]">
            Dealer Network
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
            Manage your dealer network, review business details, and monitor
            dealer account status.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchDealers}
            disabled={loading || Boolean(updatingDealerId)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#111615] transition hover:bg-black/[0.03] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard/dealers/create")}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111615] px-4 text-sm font-semibold text-white transition hover:bg-black"
          >
            <Plus size={17} />
            Create Dealer
          </button>
        </div>
      </div>

      {/* Status feedback */}
      {notice && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">{notice}</div>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-black/50">Total Dealers</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b8f34a]/25">
              <Building2 size={19} className="text-[#456b0c]" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-[#111615]">
            {dealers.length}
          </p>
          <p className="mt-1 text-xs text-black/40">
            Registered dealer accounts
          </p>
        </div>

        <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-black/50">Active Dealers</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <CheckCircle2 size={19} className="text-emerald-600" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-[#111615]">
            {activeCount}
          </p>
          <p className="mt-1 text-xs text-black/40">
            Currently active
          </p>
        </div>

        <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-black/50">Inactive Dealers</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <Users size={19} className="text-orange-600" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-[#111615]">
            {inactiveCount}
          </p>
          <p className="mt-1 text-xs text-black/40">
            Currently inactive
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-black/[0.07] bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search business, dealer code, city, email..."
            className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#fafbf9] pl-11 pr-10 text-sm text-[#111615] outline-none transition focus:border-[#8fca32] focus:ring-4 focus:ring-[#b8f34a]/10"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35 hover:text-black"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-11 rounded-xl border border-black/[0.08] bg-[#fafbf9] px-4 text-sm text-[#111615] outline-none focus:border-[#8fca32]"
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Error feedback */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={fetchDealers}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Dealer directory */}
      <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
          <div>
            <h2 className="font-bold text-[#111615]">
              Registered Dealers
            </h2>
            <p className="mt-1 text-xs text-black/40">
              {filteredDealers.length} dealer
              {filteredDealers.length === 1 ? "" : "s"} found
            </p>
          </div>

          <span className="rounded-lg bg-[#b8f34a]/20 px-3 py-1.5 text-xs font-semibold text-[#456b0c]">
            Dealer Directory
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-black/45">
            <LoaderCircle size={20} className="animate-spin" />
            Loading dealer network...
          </div>
        ) : !error && filteredDealers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Building2 size={35} className="mx-auto text-black/20" />
            <h3 className="mt-4 font-semibold text-[#111615]">
              No dealers found
            </h3>
            <p className="mt-1 text-sm text-black/45">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-[#f8f9f6] text-xs uppercase tracking-wide text-black/45">
                <tr>
                  <th className="px-5 py-4 font-semibold">Dealer</th>
                  <th className="px-5 py-4 font-semibold">Contact</th>
                  <th className="px-5 py-4 font-semibold">Location</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Details</th>
                  <th className="px-5 py-4 font-semibold">Account Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/[0.05]">
                {filteredDealers.map((dealer) => {
                  const isActive = dealer.isActive !== false;
                  const isUpdating = updatingDealerId === dealer._id;

                  return (
                    <tr
                      key={dealer._id}
                      className="transition hover:bg-[#fafbf8]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#111615] text-sm font-bold text-[#b8f34a]">
                            {(dealer.businessName || "D")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-[#111615]">
                              {dealer.businessName || "Unnamed Dealer"}
                            </p>
                            <p className="mt-1 text-xs text-black/40">
                              {dealer.dealerCode || "No dealer code"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          <p className="flex items-center gap-2 text-xs text-black/65">
                            <Mail size={13} className="shrink-0 text-black/35" />
                            {dealer.email || "—"}
                          </p>
                          <p className="flex items-center gap-2 text-xs text-black/65">
                            <Phone size={13} className="shrink-0 text-black/35" />
                            {dealer.phone || "—"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="flex items-center gap-2 text-xs text-black/65">
                          <MapPin size={14} className="shrink-0 text-black/35" />
                          {[dealer.city, dealer.state]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </p>
                        <p className="mt-1 pl-5 text-xs text-black/35">
                          {dealer.pincode || ""}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-orange-500"
                            }`}
                          />
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/dashboard/dealers/${dealer._id}/edit`)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-black/[0.08] px-3 py-2 text-xs font-semibold text-[#111615] transition hover:border-[#8fca32] hover:bg-[#b8f34a]/10"
                        >
                          View / Edit
                          <ChevronRight size={14} />
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(dealer)}
                          disabled={Boolean(updatingDealerId)}
                          className={`inline-flex min-w-[125px] items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            isActive
                              ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {isUpdating ? (
                            <LoaderCircle size={15} className="animate-spin" />
                          ) : (
                            <Power size={15} />
                          )}

                          {isUpdating
                            ? "Updating..."
                            : isActive
                              ? "Deactivate"
                              : "Activate"}
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
    </div>
  );
}

export default DealerNetwork;

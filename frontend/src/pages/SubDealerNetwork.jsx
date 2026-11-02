
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  UsersRound,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Network,
  Filter,
  Pencil,
  Power,
} from "lucide-react";
import api from "../services/api";

function SubDealerNetwork() {
  const navigate = useNavigate();

  const [subDealers, setSubDealers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [search, setSearch] = useState("");
  const [dealerFilter, setDealerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [subDealerResponse, dealerResponse] = await Promise.all([
        api.get("/sub-dealers"),
        api.get("/dealers/all"),
      ]);

      const subDealerData = subDealerResponse.data?.subDealers;
      const dealerData =
        dealerResponse.data?.dealers ||
        dealerResponse.data?.allDealers;

      setSubDealers(Array.isArray(subDealerData) ? subDealerData : []);
      setDealers(Array.isArray(dealerData) ? dealerData : []);
    } catch (err) {
      console.error("Failed to load Sub-Dealer Network:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load Sub-Dealers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleStatus = async (item) => {
    const nextStatus = item.isActive === false;

    const action = nextStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${item.businessName}"?`
    );

    if (!confirmed) return;

    setUpdatingId(item._id);
    setActionError("");

    try {
      await api.patch(`/sub-dealers/${item._id}/status`, {
        isActive: nextStatus,
      });

      await fetchData();
    } catch (err) {
      console.error("Failed to update Sub-Dealer status:", err);

      setActionError(
        err.response?.data?.message ||
          `Unable to ${action} this Sub-Dealer. Please try again.`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredSubDealers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subDealers.filter((item) => {
      const dealer =
        item.dealerId && typeof item.dealerId === "object"
          ? item.dealerId
          : null;

      const matchesSearch =
        !query ||
        [
          item.businessName,
          item.subDealerCode,
          item.email,
          item.phone,
          item.city,
          item.state,
          dealer?.businessName,
          dealer?.dealerCode,
        ].some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

      const parentDealerId = dealer?._id || item.dealerId || "";

      const matchesDealer =
        dealerFilter === "all" ||
        String(parentDealerId) === dealerFilter;

      const isActive = item.isActive !== false;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchesSearch && matchesDealer && matchesStatus;
    });
  }, [subDealers, search, dealerFilter, statusFilter]);

  const activeCount = subDealers.filter(
    (item) => item.isActive !== false
  ).length;

  const inactiveCount = subDealers.length - activeCount;

  const stats = [
    {
      label: "Total Sub-Dealers",
      value: subDealers.length,
      icon: UsersRound,
      note: "Across the network",
    },
    {
      label: "Active Accounts",
      value: activeCount,
      icon: CheckCircle2,
      note: "Currently active",
    },
    {
      label: "Inactive Accounts",
      value: inactiveCount,
      icon: XCircle,
      note: "Deactivated accounts",
    },
    {
      label: "Parent Dealers",
      value: new Set(
        subDealers
          .map((item) => {
            const dealer =
              item.dealerId && typeof item.dealerId === "object"
                ? item.dealerId._id
                : item.dealerId;

            return dealer ? String(dealer) : null;
          })
          .filter(Boolean)
      ).size,
      icon: Building2,
      note: "With Sub-Dealers",
    },
  ];

  return (
    <div className="min-h-full space-y-6 bg-[#f6f8f6] p-4 text-[#17201c] sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#66806e]">
            <Network size={15} />
            Network Management
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Sub-Dealer Network
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            View and monitor Sub-Dealers and their assigned parent Dealers.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={fetchData}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight">
                    {loading ? "—" : stat.value}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">{stat.note}</p>
                </div>

                <div className="rounded-xl bg-[#eef6e5] p-3 text-[#527b24]">
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-base font-bold">Sub-Dealer Directory</h2>
              <p className="mt-1 text-sm text-gray-500">
                Search accounts and filter by parent Dealer or account status.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search Sub-Dealers..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#8ebc4b] focus:bg-white"
                />
              </div>

              <div className="relative">
                <Filter
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  value={dealerFilter}
                  onChange={(event) => setDealerFilter(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-8 text-sm outline-none focus:border-[#8ebc4b] sm:w-52"
                >
                  <option value="all">All Parent Dealers</option>

                  {dealers.map((dealer) => (
                    <option key={dealer._id} value={dealer._id}>
                      {dealer.businessName} ({dealer.dealerCode})
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#8ebc4b]"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Sub-Dealer</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Parent Dealer</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {!loading &&
                filteredSubDealers.map((item) => {
                  const dealer =
                    item.dealerId && typeof item.dealerId === "object"
                      ? item.dealerId
                      : null;

                  const isActive = item.isActive !== false;
                  const isUpdating = updatingId === item._id;

                  return (
                    <tr
                      key={item._id}
                      className="transition hover:bg-gray-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {item.businessName || "Unnamed Sub-Dealer"}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {item.subDealerCode || "No code"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-gray-700">{item.email || "—"}</div>
                        <div className="mt-1 text-xs text-gray-400">
                          {item.phone || "—"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">
                          {dealer?.businessName || "Unknown Dealer"}
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          {dealer?.dealerCode || ""}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {[item.city, item.state].filter(Boolean).join(", ") || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Edit Sub-Dealer"
                            onClick={() =>
                              navigate(
                                `/dashboard/sub-dealers/${item._id}/edit`
                              )
                            }
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            title={isActive ? "Deactivate" : "Activate"}
                            onClick={() => handleToggleStatus(item)}
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              isActive
                                ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {isUpdating ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <Power size={14} />
                            )}
                            {isUpdating
                              ? "Updating..."
                              : isActive
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!loading && filteredSubDealers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <UsersRound size={22} />
                    </div>

                    <p className="mt-3 font-semibold text-gray-700">
                      No Sub-Dealers found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Try changing your search or filter selections.
                    </p>
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-14 text-center text-sm text-gray-500"
                  >
                    Loading Sub-Dealer Network...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 px-6 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {loading ? "—" : filteredSubDealers.length} of{" "}
            {loading ? "—" : subDealers.length} Sub-Dealers
          </span>

          <span>TEJO EV · Network Management</span>
        </div>
      </section>
    </div>
  );
}

export default SubDealerNetwork;

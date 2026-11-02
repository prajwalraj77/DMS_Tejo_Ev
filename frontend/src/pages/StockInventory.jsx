
import { useEffect, useState } from "react";
import api from "../services/api.js";
import {
  Search,
  Package,
  Bike,
  CheckCircle2,
  Building2,
  ScanLine,
  RefreshCw,
  Filter,
} from "lucide-react";

function StockInventory() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

const fetchVehicles = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await api.get("/vehicles");

    setVehicles(response.data.allVehicle || []);
  } catch (error) {
    console.error("Failed to fetch inventory:", error);

    setError(
      error.response?.data?.message ||
        "Failed to load vehicle inventory."
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchVehicles();
  }, []);

  const getDealerName = (vehicle) => {
    const destination = vehicle.allocatedToId;

    if (destination && typeof destination === "object") {
      return (
        destination.businessName ||
        destination.dealerCode ||
        "Dealer assigned"
      );
    }

    if (destination) {
      return `Dealer ID: ${destination}`;
    }

    return "Not allocated";
  };

  const getStatus = (vehicle) => {
    // Support older records while their database statuses are migrated.
    if (vehicle.status === "AVAILABLE") {
      return vehicle.allocatedToId ? "ALLOCATED" : "NOT_ALLOCATED";
    }

    return vehicle.status;
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const query = search.trim().toLowerCase();
    const status = getStatus(vehicle);

    const matchesSearch = [
      vehicle.model?.name,
      vehicle.inventoryItem?.name,
      vehicle.chassisNumber,
      vehicle.motorNumber,
      vehicle.batteryNumber,
      vehicle.controllerNumber,
      vehicle.chargerNumber,
      vehicle.colour,
      status,
      vehicle.stockOwner,
      vehicle.allocatedToId?.businessName,
      vehicle.allocatedToId?.dealerCode,
      typeof vehicle.allocatedToId === "string"
        ? vehicle.allocatedToId
        : "",
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );

    const matchesStatus =
      statusFilter === "ALL" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const allocatedCount = vehicles.filter(
    (vehicle) => getStatus(vehicle) === "ALLOCATED"
  ).length;

  const notAllocatedCount = vehicles.filter(
    (vehicle) => getStatus(vehicle) === "NOT_ALLOCATED"
  ).length;

  const soldCount = vehicles.filter(
    (vehicle) => getStatus(vehicle) === "SOLD"
  ).length;

  const getStatusStyle = (status) => {
    switch (status) {
      case "ALLOCATED":
        return "bg-blue-400/10 text-blue-400";
      case "NOT_ALLOCATED":
        return "bg-gray-400/10 text-gray-300";
      case "SOLD":
        return "bg-lime-400/10 text-lime-400";
      default:
        return "bg-gray-400/10 text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-10 text-gray-400">
        <RefreshCw className="h-5 w-5 animate-spin" />
        Loading vehicle inventory...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchVehicles}
          className="mt-4 rounded-xl bg-lime-400 px-4 py-2 font-semibold text-black"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium tracking-wide text-lime-400">
            INVENTORY MANAGEMENT
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Stock Inventory
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Track vehicles, allocation status, and destination dealers.
          </p>
        </div>

        <button
          onClick={fetchVehicles}
          className="flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Inventory
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#151a18] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Total Vehicles</p>
            <Package className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">
            {vehicles.length}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-400/10 bg-[#151a18] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Allocated</p>
            <Building2 className="h-5 w-5 text-blue-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-blue-400">
            {allocatedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#151a18] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Not Allocated</p>
            <Bike className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-300">
            {notAllocatedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-lime-400/10 bg-[#151a18] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Sold</p>
            <CheckCircle2 className="h-5 w-5 text-lime-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-lime-400">
            {soldCount}
          </p>
        </div>
      </div>

      {/* Search and Status Filter */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_240px]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search chassis, motor, battery, model, dealer..."
            className="w-full rounded-xl border border-white/10 bg-[#151a18] py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-lime-400/50"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-[#151a18] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-lime-400/50"
          >
            <option value="ALL">All Statuses</option>
            <option value="ALLOCATED">Allocated</option>
            <option value="NOT_ALLOCATED">Not Allocated</option>
            <option value="SOLD">Sold</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#151a18]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">Vehicle Records</h2>
            <p className="mt-1 text-xs text-gray-500">
              {filteredVehicles.length} vehicle(s) found
            </p>
          </div>
          <ScanLine className="h-5 w-5 text-lime-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left text-sm">
            <thead className="border-b border-white/10 bg-[#101412] text-gray-400">
              <tr>
                <th className="px-5 py-4">Vehicle</th>
                <th className="px-5 py-4">Chassis Number</th>
                <th className="px-5 py-4">Motor Number</th>
                <th className="px-5 py-4">Battery Number</th>
                <th className="px-5 py-4">Colour</th>
                <th className="px-5 py-4">Stock Owner</th>
                <th className="px-5 py-4">Allocated Dealer</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredVehicles.map((vehicle) => {
                const status = getStatus(vehicle);

                return (
                  <tr
                    key={vehicle._id}
                    className="transition hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">
                        {vehicle.model?.name || "Model unavailable"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {vehicle.inventoryItem?.name || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4">{vehicle.chassisNumber}</td>
                    <td className="px-5 py-4">{vehicle.motorNumber}</td>
                    <td className="px-5 py-4">{vehicle.batteryNumber}</td>
                    <td className="px-5 py-4">{vehicle.colour}</td>
                    <td className="px-5 py-4">
                      {vehicle.stockOwner || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                        <span
                          className={
                            vehicle.allocatedToId
                              ? "font-medium text-white"
                              : "text-gray-500"
                          }
                        >
                          {getDealerName(vehicle)}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredVehicles.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Package className="mx-auto h-9 w-9 text-gray-500" />
            <p className="mt-3 font-medium text-white">
              No vehicles found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Try another search term or status filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StockInventory;

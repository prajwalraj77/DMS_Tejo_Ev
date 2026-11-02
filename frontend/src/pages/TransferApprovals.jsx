
import { useEffect, useState } from "react";
import {
  Package,
  Bike,
  Battery,
  Palette,
  ScanLine,
  User,
  Clock3,
  CheckCircle2,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import api from "../services/api.js";

function TransferApprovals() {
  const [pendingStocks, setPendingStocks] = useState([]);
  const [source] = useState("TEJO EV Head Office");
  const [destination, setDestination] = useState({});
  const [dealers, setDealers] = useState([]);

  const [isLoadingStocks, setIsLoadingStocks] = useState(true);
  const [isLoadingDealers, setIsLoadingDealers] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Load pending stock entries
  const fetchPendingStocks = async () => {
    try {
      setError("");

      const response = await api.get("/stock-inwards/pending");

      setPendingStocks(response.data.pendingStocks || []);
    } catch (error) {
      console.error("Failed to load pending stock:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load pending stock entries. Please try again."
      );
    } finally {
      setIsLoadingStocks(false);
    }
  };

  // Load active dealers
  const fetchDealers = async () => {
    try {
      const response = await api.get("/dealers");

      setDealers(response.data.Alldealers || []);
    } catch (error) {
      console.error("Failed to load dealers:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load dealers. Please refresh the page."
      );
    } finally {
      setIsLoadingDealers(false);
    }
  };

  useEffect(() => {
    fetchPendingStocks();
    fetchDealers();
  }, []);

  // Approve a pending stock entry
  const handleApprove = async (stock) => {
    const selectedDestination = destination[stock._id];

    if (!selectedDestination) {
      setNotice("");
      setError("Please select a destination dealer.");
      return;
    }

    if (approvingId) return;

    setApprovingId(stock._id);
    setError("");
    setNotice("");

    try {
      const response = await api.patch(
        `/stock-inwards/${stock._id}/approve`,
        {
          source,
          destination: selectedDestination,
        }
      );

      setNotice(
        response.data.message || "Stock approved successfully."
      );

      // Remove the approved stock from the pending list
      setPendingStocks((currentStocks) =>
        currentStocks.filter((item) => item._id !== stock._id)
      );

      // Clear the selected destination for this stock
      setDestination((current) => {
        const updated = { ...current };
        delete updated[stock._id];
        return updated;
      });
    } catch (error) {
      console.error("Approval failed:", error);

      setError(
        error.response?.data?.message ||
          "Failed to approve stock. Please try again."
      );
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-sm font-medium text-lime-400">
          INVENTORY MANAGEMENT
        </p>

        <h1 className="mt-1 text-2xl font-bold text-white">
          Transfer Approvals
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          Review and approve pending stock transfers.
        </p>
      </div>

      {/* Notification Messages */}
      {(error || notice) && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            error
              ? "border-red-500/20 bg-red-500/10 text-red-300"
              : "border-lime-400/20 bg-lime-400/10 text-lime-300"
          }`}
        >
          {error ? (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          )}

          <p className="text-sm">{error || notice}</p>
        </div>
      )}

      {/* Pending Count */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10">
          <Clock3 className="h-5 w-5 text-yellow-400" />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Pending Requests
          </p>

          <p className="text-lg font-semibold text-white">
            {pendingStocks.length}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingStocks && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#151a18] px-6 py-12 text-gray-400">
          <LoaderCircle className="h-5 w-5 animate-spin text-lime-400" />

          <p className="text-sm">Loading pending stock...</p>
        </div>
      )}

      {/* Pending Stock Cards */}
      {!isLoadingStocks && (
        <div className="space-y-5">
          {pendingStocks.map((stock) => {
            const isApproving = approvingId === stock._id;

            return (
              <div
                key={stock._id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#151a18]"
              >
                {/* Card Header */}
                <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400/10">
                        <Bike className="h-5 w-5 text-lime-400" />
                      </div>

                      <div>
                        <h2 className="font-semibold text-white">
                          {stock.model?.name || "Unknown Model"}
                        </h2>

                        <p className="text-sm text-gray-400">
                          {stock.inventoryItem?.name ||
                            "Unknown Inventory Item"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <span className="w-fit rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                    {stock.status}
                  </span>
                </div>

                {/* Vehicle Details */}
                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-gray-500">Battery</p>

                    <p className="mt-1 font-medium text-white">
                      {stock.batteryVariant?.name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Colour</p>

                    <div className="mt-1 flex items-center gap-2">
                      <Palette className="h-4 w-4 text-gray-400" />

                      <p className="font-medium text-white">
                        {stock.colour || "—"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">GST Rate</p>

                    <p className="mt-1 font-medium text-white">
                      {stock.gstRate}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Submitted By</p>

                    <div className="mt-1 flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />

                      <p className="font-medium text-white">
                        {stock.submittedBy?.name || "Unknown User"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Identification */}
                <div className="mx-5 rounded-xl border border-white/10 bg-[#101412] p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <ScanLine className="h-4 w-4 text-lime-400" />

                    <p className="text-sm font-semibold text-white">
                      Vehicle Identification
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Chassis Number
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-white">
                        {stock.chassisNumber || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Motor Number
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-white">
                        {stock.motorNumber || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Battery Number
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-white">
                        {stock.batteryNumber || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Controller Number
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-white">
                        {stock.controllerNumber || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-gray-500">
                      Charger Number
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-white">
                      {stock.chargerNumber || "—"}
                    </p>
                  </div>
                </div>

                {/* Submission Information */}
                <div className="flex items-center gap-2 px-5 py-4 text-xs text-gray-500">
                  <Clock3 className="h-4 w-4" />

                  Submitted on{" "}
                  {stock.createdAt
                    ? new Date(stock.createdAt).toLocaleString()
                    : "Unknown date"}
                </div>

                {/* Source and Destination Selection */}
                <div className="grid grid-cols-1 gap-4 border-t border-white/10 p-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Source
                    </label>

                    <select
                      value={source}
                      disabled
                      className="w-full rounded-xl border border-white/10 bg-[#101412] px-4 py-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-80"
                    >
                      <option value="TEJO EV Head Office">
                        TEJO EV Head Office
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Destination Dealer
                    </label>

                    <select
                      value={destination[stock._id] || ""}
                      disabled={isApproving || isLoadingDealers}
                      onChange={(event) =>
                        setDestination((current) => ({
                          ...current,
                          [stock._id]: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#101412] px-4 py-3 text-sm text-white outline-none focus:border-lime-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {isLoadingDealers
                          ? "Loading dealers..."
                          : "Select a dealer"}
                      </option>

                      {dealers.map((dealer) => (
                        <option key={dealer._id} value={dealer._id}>
                          {dealer.businessName} — {dealer.dealerCode}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Approval Area */}
                <div className="flex flex-col gap-3 border-t border-white/10 bg-[#121715] p-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled
                    className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-500"
                  >
                    Review
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(stock)}
                    disabled={isApproving || isLoadingDealers}
                    className="flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isApproving ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Approve Transfer
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoadingStocks && pendingStocks.length === 0 && !error && (
        <div className="rounded-2xl border border-white/10 bg-[#151a18] px-6 py-12 text-center">
          <Package className="mx-auto h-10 w-10 text-gray-500" />

          <h2 className="mt-4 text-lg font-semibold text-white">
            No pending approvals
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            All stock transfer requests have been processed.
          </p>
        </div>
      )}
    </div>
  );
}

export default TransferApprovals;

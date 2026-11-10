import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  LayoutGrid,
  ReceiptText,
  BarChart3,
  Truck,
  UsersRound,
  Package,
  Upload,
  ClipboardCheck,
  Boxes,
  Settings,
  ChevronDown,
  ChevronRight,
  Building2,
  Network,
  UserRoundCog, Store,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const [dealersOpen, setDealersOpen] = useState(true);
  const [stockOpen, setStockOpen] = useState(true);

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="flex h-screen w-[250px] shrink-0 flex-col bg-[#111615] text-white">

      {/* Brand */}
      <div className="px-5 pb-8 pt-6">
        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#b8f34a] text-sm font-black text-[#111615]">
            TE
          </div>

          <div>
            <h1 className="text-[18px] font-bold tracking-tight">
              TEJO <span className="text-[#b8f34a]">EV</span>
            </h1>

            <p className="text-[9px] uppercase tracking-[0.25em] text-white/35">
              Mobility Systems
            </p>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3">

        {/* Workspace */}
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
          Workspace
        </p>

        {/* Dashboard */}
        <Link
          to="/dashboard"
          className={`group mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-all duration-200 ${isActive("/dashboard")
            ? "bg-white/[0.08] text-white"
            : "text-white/55 hover:bg-white/[0.04] hover:text-white"
            }`}
        >
          <LayoutGrid
            size={17}
            strokeWidth={1.7}
            className={
              isActive("/dashboard")
                ? "text-[#b8f34a]"
                : "text-white/40 group-hover:text-[#b8f34a]"
            }
          />

          Dashboard
        </Link>

        {/* Sales */}
        <Link
          to="/dashboard/billing"
          className={`group mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-all ${
            isActive("/dashboard/billing")
              ? "bg-[#b8f34a] font-semibold text-[#111615]"
              : "text-white/55 hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <ReceiptText
            size={17}
            strokeWidth={1.7}
            className={
              isActive("/dashboard/billing")
                ? "text-[#111615]"
                : "text-white/40 group-hover:text-[#b8f34a]"
            }
          />
          <span>Sales & Billing</span>
        </Link>

        {/* Delivery */}
        <Link
          to="/dashboard/delivery"
          className={`group mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-all ${
            isActive("/dashboard/delivery")
              ? "bg-[#b8f34a] font-semibold text-[#111615]"
              : "text-white/55 hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <Truck
            size={17}
            strokeWidth={1.7}
            className={
              isActive("/dashboard/delivery")
                ? "text-[#111615]"
                : "text-white/40 group-hover:text-[#b8f34a]"
            }
          />
          <span>Vehicle Delivery</span>
        </Link>

        {/* Reports */}
        <Link
          to="/dashboard/reports"
          className={`group mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-all ${
            isActive("/dashboard/reports")
              ? "bg-[#b8f34a] font-semibold text-[#111615]"
              : "text-white/55 hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <BarChart3
            size={17}
            strokeWidth={1.7}
            className={
              isActive("/dashboard/reports")
                ? "text-[#111615]"
                : "text-white/40 group-hover:text-[#b8f34a]"
            }
          />
          <span>Reports</span>
        </Link>

        {/* Dealers */}
        <div className="mt-6">

          <button
            type="button"
            onClick={() => setDealersOpen(!dealersOpen)}
            className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25"
          >
            <span>Network</span>

            {dealersOpen ? (
              <ChevronDown size={13} />
            ) : (
              <ChevronRight size={13} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setDealersOpen(!dealersOpen)}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-white/60 transition hover:bg-white/[0.04] hover:text-white"
          >
            <UsersRound size={17} strokeWidth={1.7} />

            <span>Dealers & Users</span>

            <span className="ml-auto text-white/25">
              {dealersOpen ? "−" : "+"}
            </span>
          </button>

          {dealersOpen && (
            <div className="ml-5 mt-1 border-l border-white/10 pl-3">

              <Link
                to="/dashboard/dealers/create"
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[12px] text-white/40 transition hover:bg-white/[0.04] hover:text-white"
              >
                <Building2 size={14} />
                Create Dealer / Franchise
              </Link>

              <Link
                to="/dashboard/dealers"
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[12px] text-white/40 transition hover:bg-white/[0.04] hover:text-white"
              >
                <Network size={14} />
                Dealer Network
              </Link>
              <Link
                to="/dashboard/sub-dealers"
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[12px] transition-all ${isActive("/dashboard/sub-dealers")
                  ? "bg-[#b8f34a] font-semibold text-[#111615]"
                  : "text-white/40 hover:bg-white/[0.04] hover:text-white"
                  }`}
              >
                <Store size={14} />
                Sub-Dealer Network
              </Link>
              <Link
                to="/dashboard/sub-dealers/create"
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[12px] transition-all ${isActive("/dashboard/sub-dealers/create")
                  ? "bg-[#b8f34a] font-semibold text-[#111615]"
                  : "text-white/40 hover:bg-white/[0.04] hover:text-white"
                  }`}
              >
                <Store size={14} />
                Create Sub-Dealer
              </Link>
              {user?.role === "ADMIN" && (
                <Link
                  to="/dashboard/users"
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[12px] transition-all ${isActive("/dashboard/users")
                      ? "bg-[#b8f34a] font-semibold text-[#111615]"
                      : "text-white/40 hover:bg-white/[0.04] hover:text-white"
                    }`}
                >
                  <UserRoundCog size={14} />
                  Create & Manage Users
                </Link>
              )}

            </div>
          )}
        </div>

        {/* Inventory */}
        <div className="mt-6">

          <button
            type="button"
            onClick={() => setStockOpen(!stockOpen)}
            className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25"
          >
            <span>Operations</span>

            {stockOpen ? (
              <ChevronDown size={13} />
            ) : (
              <ChevronRight size={13} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setStockOpen(!stockOpen)}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-white/60 transition hover:bg-white/[0.04] hover:text-white"
          >
            <Package size={17} strokeWidth={1.7} />

            <span>Stock & Transfers</span>

            <span className="ml-auto text-white/25">
              {stockOpen ? "−" : "+"}
            </span>
          </button>

          {stockOpen && (
            <div className="ml-5 mt-1 border-l border-white/10 pl-3">

              <Link
                to="/dashboard/stock/upload"
                className={`group flex items-center gap-2.5 rounded-md px-3 py-2 text-[12px] transition-all ${isActive("/dashboard/stock/upload")
                  ? "bg-[#b8f34a] font-semibold text-[#111615]"
                  : "text-white/40 hover:bg-white/[0.04] hover:text-white"
                  }`}
              >
                <Upload size={14} />
                Stock Upload / Inward
              </Link>

              <Link
                to="/dashboard/stock/approvals"
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[12px] transition-all ${isActive("/dashboard/stock/approvals")
                  ? "bg-[#b8f34a] font-semibold text-[#111615]"
                  : "text-white/40 hover:bg-white/[0.04] hover:text-white"
                  }`}
              >
                <ClipboardCheck size={14} />
                Transfer Approvals
              </Link>

              <Link
                to="/dashboard/stock/inventory"
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[12px] transition-all ${isActive("/dashboard/stock/inventory")
                  ? "bg-[#b8f34a] font-semibold text-[#111615]"
                  : "text-white/40 hover:bg-white/[0.04] hover:text-white"
                  }`}
              >
                <Boxes size={14} />
                Stock Inventory
              </Link>

            </div>
          )}
        </div>

        {/* Administration */}
        <div className="mt-6">

          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
            System
          </p>

          <div className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-white/50 transition hover:bg-white/[0.04] hover:text-white">
            <Settings size={17} strokeWidth={1.7} />

            <span>Administration</span>

            <ChevronRight size={14} className="ml-auto text-white/25" />
          </div>

        </div>

      </nav>

      {/* Admin */}
      <div className="border-t border-white/[0.07] p-4">

        <div className="flex items-center gap-3">

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b8f34a] text-xs font-bold text-[#111615]">
            A
          </div>

          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold">
              TEJO EV Admin
            </p>

            <p className="truncate text-[10px] text-white/30">
              Head Office
            </p>
          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;
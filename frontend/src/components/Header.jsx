
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const userName = user?.name || user?.fullName || "User";
  const userRole = user?.role || "Employee";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-black/[0.06] bg-[#f4f5f2]/95 px-5 backdrop-blur-md sm:px-7">

      {/* Search */}
      <div className="relative w-full max-w-[460px]">
        <Search
          size={18}
          strokeWidth={1.8}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
        />

        <input
          type="text"
          placeholder="Search dealers, vehicles, invoices..."
          className="h-11 w-full rounded-xl border border-black/[0.08] bg-white pl-11 pr-4 text-sm text-black outline-none transition-all placeholder:text-black/35 focus:border-[#8fca32] focus:ring-4 focus:ring-[#b8f34a]/10"
        />
      </div>

      {/* Right side */}
      <div className="ml-6 flex items-center gap-4">

        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-black/55 transition hover:bg-white hover:text-black"
        >
          <Bell size={19} strokeWidth={1.8} />

          <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-[#f4f5f2]" />
        </button>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-black/[0.08] sm:block" />

        {/* User profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b8f34a] text-xs font-bold text-[#111615]">
              {userInitial}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-[13px] font-semibold leading-tight text-[#111615]">
                {userName}
              </p>

              <p className="mt-0.5 text-[10px] text-black/40">
                {userRole}
              </p>
            </div>

            <ChevronDown
              size={15}
              className={`hidden text-black/35 transition-transform sm:block ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-black/[0.08] bg-white p-1.5 shadow-lg">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;

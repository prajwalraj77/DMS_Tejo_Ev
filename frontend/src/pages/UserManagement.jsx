
import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
    Search,
    RefreshCw,
    UsersRound,
    UserCheck,
    UserX,
    ShieldCheck,
    Mail,
    CalendarDays,
    Plus,
    Pencil,
    KeyRound,
    Eye,
    EyeOff,
    X,
} from "lucide-react";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function UserManagement() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Password reset states
    const [resetUser, setResetUser] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState("");
    const [resetSuccess, setResetSuccess] = useState("");

    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/users");
            setUsers(response.data.users || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load users. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Activate / Deactivate user
    const handleToggleStatus = async (selectedUser) => {
        const newStatus = !selectedUser.isActive;
        const action = newStatus ? "activate" : "deactivate";

        if (
            !window.confirm(
                `Are you sure you want to ${action} ${selectedUser.name}?`
            )
        ) {
            return;
        }

        try {
            setError("");

            await api.patch(`/users/${selectedUser._id}/status`, {
                isActive: newStatus,
            });

            setUsers((previousUsers) =>
                previousUsers.map((item) =>
                    item._id === selectedUser._id
                        ? { ...item, isActive: newStatus }
                        : item
                )
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                `Unable to ${action} user. Please try again.`
            );
        }
    };

    // Reset user password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        setResetError("");
        setResetSuccess("");

        if (!newPassword || newPassword.length < 8) {
            setResetError("Password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setResetError("Passwords do not match.");
            return;
        }

        if (!resetUser) {
            setResetError("Please select a user.");
            return;
        }

        if (
            !window.confirm(
                `Are you sure you want to reset the password for ${resetUser.name}?`
            )
        ) {
            return;
        }

        try {
            setResetLoading(true);

            await api.patch(
                `/users/${resetUser._id}/reset-password`,
                { newPassword }
            );

            setResetSuccess("Password reset successfully.");

            setNewPassword("");
            setConfirmPassword("");

            // Close modal after showing success
            setTimeout(() => {
                setResetUser(null);
                setResetSuccess("");
                setResetError("");
            }, 1500);
        } catch (err) {
            setResetError(
                err.response?.data?.message ||
                "Unable to reset password. Please try again."
            );
        } finally {
            setResetLoading(false);
        }
    };

    // Summary statistics
    const stats = useMemo(
        () => ({
            total: users.length,
            active: users.filter((item) => item.isActive).length,
            inactive: users.filter((item) => !item.isActive).length,
            admins: users.filter((item) => item.role === "ADMIN").length,
        }),
        [users]
    );

    // Search and filters
    const filteredUsers = useMemo(() => {
        return users.filter((item) => {
            const searchValue = search.toLowerCase();

            const matchesSearch =
                item.name?.toLowerCase().includes(searchValue) ||
                item.email?.toLowerCase().includes(searchValue);

            const matchesRole =
                roleFilter === "ALL" || item.role === roleFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && item.isActive) ||
                (statusFilter === "INACTIVE" && !item.isActive);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, search, roleFilter, statusFilter]);

    // Role badge styling
    const getRoleStyle = (role) => {
        const styles = {
            ADMIN: "bg-purple-50 text-purple-700",
            DEALER: "bg-blue-50 text-blue-700",
            SUB_DEALER: "bg-orange-50 text-orange-700",
            SALES_EXECUTIVE: "bg-indigo-50 text-indigo-700",
            HR: "bg-pink-50 text-pink-700",
        };

        return styles[role] || "bg-gray-100 text-gray-600";
    };

    // Admin-only access check after all hooks
    if (user?.role !== "ADMIN") {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-7">

            {/* Page Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7baa27]">
                        Administration
                    </p>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#111615]">
                        User Management
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage TEJO EV system users and their account status.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={fetchUsers}
                        disabled={loading}
                        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={15}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/users/create")}
                        className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#111615] px-4 text-sm font-semibold text-white hover:bg-black"
                    >
                        <Plus size={16} />
                        Create User
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={stats.total}
                    icon={<UsersRound size={20} />}
                />

                <StatCard
                    title="Active Users"
                    value={stats.active}
                    icon={<UserCheck size={20} />}
                />

                <StatCard
                    title="Inactive Users"
                    value={stats.inactive}
                    icon={<UserX size={20} />}
                />

                <StatCard
                    title="Administrators"
                    value={stats.admins}
                    icon={<ShieldCheck size={20} />}
                />
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <div className="relative">
                        <Search
                            size={17}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name or email..."
                            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-[#9acb42] focus:bg-white"
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[#9acb42]"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="DEALER">Dealer</option>
                        <option value="SUB_DEALER">Sub-Dealer</option>
                        <option value="SALES_EXECUTIVE">Sales Executive</option>
                        <option value="HR">HR</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[#9acb42]"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* User Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

                <div className="flex flex-col justify-between gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-bold text-[#111615]">
                            System Users
                        </h2>

                        <p className="mt-1 text-xs text-gray-400">
                            Showing {filteredUsers.length} of {users.length} users
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-left">

                        <thead className="bg-gray-50">
                            <tr className="text-[11px] uppercase tracking-wider text-gray-400">
                                <th className="px-5 py-4 font-semibold">User</th>
                                <th className="px-5 py-4 font-semibold">Role</th>
                                <th className="px-5 py-4 font-semibold">Status</th>
                                <th className="px-5 py-4 font-semibold">
                                    Email Verification
                                </th>
                                <th className="px-5 py-4 font-semibold">Created</th>
                                <th className="px-5 py-4 text-center font-semibold">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-5 py-12 text-center text-sm text-gray-400"
                                    >
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-5 py-12 text-center text-sm text-gray-400"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((item) => (
                                    <tr
                                        key={item._id}
                                        className="transition hover:bg-gray-50/70"
                                    >

                                        {/* User */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#b8f34a]/20 text-sm font-bold text-[#567c18]">
                                                    {item.name?.charAt(0)?.toUpperCase() || "U"}
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {item.name}
                                                    </p>

                                                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                                                        <Mail size={12} />
                                                        {item.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${getRoleStyle(
                                                    item.role
                                                )}`}
                                            >
                                                {item.role?.replaceAll("_", " ")}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${item.isActive
                                                        ? "text-green-700"
                                                        : "text-red-600"
                                                    }`}
                                            >
                                                <span
                                                    className={`h-2 w-2 rounded-full ${item.isActive
                                                            ? "bg-green-500"
                                                            : "bg-red-500"
                                                        }`}
                                                />

                                                {item.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        {/* Email Verification */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`text-xs font-medium ${item.isEmailVerified
                                                        ? "text-green-700"
                                                        : "text-gray-400"
                                                    }`}
                                            >
                                                {item.isEmailVerified
                                                    ? "Verified"
                                                    : "Not verified"}
                                            </span>
                                        </td>

                                        {/* Created Date */}
                                        <td className="px-5 py-4">
                                            <span className="flex items-center gap-2 text-xs text-gray-500">
                                                <CalendarDays size={14} />

                                                {item.createdAt
                                                    ? new Date(item.createdAt).toLocaleDateString(
                                                        "en-IN"
                                                    )
                                                    : "—"}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-2">

                                                {/* Edit */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/dashboard/users/${item._id}/edit`
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-[#9acb42] hover:bg-[#b8f34a]/10"
                                                >
                                                    <Pencil size={14} />
                                                    Edit
                                                </button>

                                                {/* Activate / Deactivate */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(item)}
                                                    disabled={
                                                        String(item._id) === String(user?.id) ||
                                                        String(item._id) === String(user?._id)
                                                    }
                                                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${item.isActive
                                                            ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                                                            : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                                        }`}
                                                >
                                                    {item.isActive ? (
                                                        <>
                                                            <UserX size={14} />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserCheck size={14} />
                                                            Activate
                                                        </>
                                                    )}
                                                </button>

                                                {/* Reset Password */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setResetUser(item);
                                                        setNewPassword("");
                                                        setConfirmPassword("");
                                                        setResetError("");
                                                        setResetSuccess("");
                                                        setShowPassword(false);
                                                    }}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                                                >
                                                    <KeyRound size={14} />
                                                    Reset Password
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>
                    </table>
                </div>
            </div>

            {/* Password Reset Modal - Correctly inside UserManagement */}
            {resetUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                        {/* Modal Header */}
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-[#111615]">
                                    Reset Password
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Account: {resetUser.name}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setResetUser(null)}
                                disabled={resetLoading}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Password Reset Form */}
                        <form
                            onSubmit={handleResetPassword}
                            className="space-y-4"
                        >

                            {/* New Password */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    New Password
                                </label>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        minLength={8}
                                        required
                                        disabled={resetLoading}
                                        placeholder="Enter new password"
                                        className="h-12 w-full rounded-xl border border-gray-200 px-4 pr-12 text-sm outline-none focus:border-[#9acb42] disabled:bg-gray-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((previous) => !previous)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Confirm New Password
                                </label>

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength={8}
                                    required
                                    disabled={resetLoading}
                                    placeholder="Confirm new password"
                                    className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#9acb42] disabled:bg-gray-100"
                                />
                            </div>

                            <p className="text-xs text-gray-400">
                                Password must contain at least 8 characters.
                            </p>

                            {/* Error */}
                            {resetError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                    {resetError}
                                </div>
                            )}

                            {/* Success */}
                            {resetSuccess && (
                                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                    {resetSuccess}
                                </div>
                            )}

                            {/* Modal Buttons */}
                            <div className="flex justify-end gap-3 pt-2">

                                <button
                                    type="button"
                                    onClick={() => setResetUser(null)}
                                    disabled={resetLoading}
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={resetLoading || !!resetSuccess}
                                    className="rounded-xl bg-[#111615] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {resetLoading
                                        ? "Resetting..."
                                        : resetSuccess
                                            ? "Password Reset"
                                            : "Reset Password"}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

// Summary Card Component
function StatCard({ title, value, icon }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500">
                    {title}
                </p>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b8f34a]/20 text-[#638d20]">
                    {icon}
                </div>
            </div>

            <p className="mt-4 text-2xl font-bold text-[#111615]">
                {value}
            </p>
        </div>
    );
}

export default UserManagement;

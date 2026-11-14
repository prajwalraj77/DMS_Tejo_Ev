import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

export default function CustomerManagement() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstin: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customers");

      setCustomers(response.data?.customers || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      gstin: "",
    });
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await api.post("/customers", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        gstin: form.gstin.trim(),
      });

      const newCustomer = response.data?.customer;

      if (newCustomer) {
        setCustomers((prev) => [
          newCustomer,
          ...prev,
        ]);
      }

      resetForm();
      setShowAddForm(false);

    } catch (err) {
      console.error("Failed to create customer:", err);

      setError(
        err.response?.data?.message ||
          "Failed to create customer."
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(value) ||
        customer.phone?.toLowerCase().includes(value) ||
        customer.email?.toLowerCase().includes(value) ||
        customer.city?.toLowerCase().includes(value) ||
        customer.gstin?.toLowerCase().includes(value)
      );
    });
  }, [customers, search]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Management
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage your customers and their contact details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setShowAddForm(true);
          }}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          + Add Customer
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, email, city or GSTIN..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
        />
      </div>

      {/* Customer count */}
      <div className="mb-4 text-sm text-gray-500">
        {loading
          ? "Loading customers..."
          : `${filteredCustomers.length} customer${
              filteredCustomers.length === 1 ? "" : "s"
            }`}
      </div>

      {/* Customer Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-lg font-semibold text-gray-800">
              No customers found
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {search
                ? "Try a different search."
                : "Add your first customer to get started."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                + Add Customer
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">

              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    Email
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    Location
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    GSTIN
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">
                        {customer.name}
                      </div>

                      <div className="text-xs text-gray-500">
                        ID: {customer._id}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {customer.phone}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {customer.email}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {[customer.city, customer.state]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {customer.gstin || "-"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCustomer(customer)
                        }
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Add Customer
                </h2>

                <p className="text-sm text-gray-500">
                  Enter customer details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAddCustomer}
              className="p-6"
            >

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Customer Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter customer name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Phone *
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter phone number"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email address"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>

                {/* GSTIN */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    GSTIN
                  </label>

                  <input
                    name="gstin"
                    value={form.gstin}
                    onChange={handleChange}
                    placeholder="Enter GSTIN"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-black"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter address"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    City
                  </label>

                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    State
                  </label>

                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Pincode
                  </label>

                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="Enter pincode"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>

              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddForm(false);
                  }}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Create Customer"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* View Customer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b px-6 py-4">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Customer Details
                </h2>

                <p className="text-sm text-gray-500">
                  Customer information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>

            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">

              <CustomerDetail
                label="Name"
                value={selectedCustomer.name}
              />

              <CustomerDetail
                label="Phone"
                value={selectedCustomer.phone}
              />

              <CustomerDetail
                label="Email"
                value={selectedCustomer.email}
              />

              <CustomerDetail
                label="GSTIN"
                value={selectedCustomer.gstin}
              />

              <CustomerDetail
                label="Address"
                value={selectedCustomer.address}
              />

              <CustomerDetail
                label="City"
                value={selectedCustomer.city}
              />

              <CustomerDetail
                label="State"
                value={selectedCustomer.state}
              />

              <CustomerDetail
                label="Pincode"
                value={selectedCustomer.pincode}
              />

            </div>

            <div className="border-t px-6 py-4 text-right">

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function CustomerDetail({ label, value }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-gray-500">
        {label}
      </div>

      <div className="mt-1 text-sm text-gray-900">
        {value || "-"}
      </div>
    </div>
  );
}
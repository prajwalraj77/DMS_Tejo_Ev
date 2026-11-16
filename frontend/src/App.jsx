import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PermissionRoute from "./components/PermissionRoute.jsx";

import StockUpload from "./pages/StockUpload.jsx";
import TransferApprovals from "./pages/TransferApprovals.jsx";
import StockInventory from "./pages/StockInventory.jsx";
import DealerNetwork from "./pages/DealerNetwork.jsx";
import CreateDealer from "./pages/CreateDealer.jsx";
import EditDealer from "./pages/EditDealer.jsx";
import SubDealerNetwork from "./pages/SubDealerNetwork.jsx";
import CreateSubDealer from "./pages/CreateSubDealer.jsx";
import EditSubDealer from "./pages/EditSubDealer.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import CreateUser from "./pages/CreateUser.jsx";
import EditUser from "./pages/EditUser.jsx";
import EmployeeForm from "./pages/EmployeeForm.jsx";
import EmployeeDirectory from "./pages/EmployeeDirectory.jsx";
import Billing from "./pages/Billing.jsx";
import Delivery from "./pages/Delivery.jsx";
import CustomerManagement from "./pages/CustomerManagement.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Authentication protection */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route path="/dashboard" element={<DashboardLayout />}>

            {/* Stock */}
            <Route element={<PermissionRoute permission="stockInwards.create" />}>
              <Route path="stock/upload" element={<StockUpload />} />
            </Route>

            <Route element={<PermissionRoute permission="stockInwards.approve" />}>
              <Route
                path="stock/approvals"
                element={<TransferApprovals />}
              />
            </Route>

            <Route element={<PermissionRoute permission="inventory.view" />}>
              <Route
                path="stock/inventory"
                element={<StockInventory />}
              />
            </Route>

            {/* Dealers */}
            <Route element={<PermissionRoute permission="dealers.view" />}>
              <Route path="dealers" element={<DealerNetwork />} />
            </Route>

            <Route element={<PermissionRoute permission="dealers.create" />}>
              <Route
                path="dealers/create"
                element={<CreateDealer />}
              />
            </Route>

            <Route element={<PermissionRoute permission="dealers.edit" />}>
              <Route
                path="dealers/:id/edit"
                element={<EditDealer />}
              />
            </Route>

            {/* Sub Dealers */}
            <Route element={<PermissionRoute permission="subDealers.view" />}>
              <Route
                path="sub-dealers"
                element={<SubDealerNetwork />}
              />
            </Route>

            <Route element={<PermissionRoute permission="subDealers.create" />}>
              <Route
                path="sub-dealers/create"
                element={<CreateSubDealer />}
              />
            </Route>

            <Route element={<PermissionRoute permission="subDealers.edit" />}>
              <Route
                path="sub-dealers/:id/edit"
                element={<EditSubDealer />}
              />
            </Route>

            {/* Users */}
            <Route element={<PermissionRoute permission="users.view" />}>
              <Route
                path="users"
                element={<UserManagement />}
              />
            </Route>

            <Route element={<PermissionRoute permission="users.create" />}>
              <Route
                path="users/create"
                element={<CreateUser />}
              />
            </Route>

            <Route element={<PermissionRoute permission="users.edit" />}>
              <Route
                path="users/:id/edit"
                element={<EditUser />}
              />
            </Route>

            {/* Employees */}
            <Route element={<PermissionRoute permission="employees.create" />}>
              <Route
                path="employees/create"
                element={<EmployeeForm />}
              />
            </Route>

            <Route element={<PermissionRoute permission="employees.view" />}>
              <Route
                path="employees"
                element={<EmployeeDirectory />}
              />
            </Route>

            {/* Billing */}
            <Route element={<PermissionRoute permission="billing.view" />}>
              <Route
                path="billing"
                element={<Billing />}
              />
            </Route>

            {/* Delivery */}
            <Route element={<PermissionRoute permission="deliveries.view" />}>
              <Route
                path="delivery"
                element={<Delivery />}
              />
            </Route>

            {/* Customers */}
            <Route element={<PermissionRoute permission="customers.view" />}>
              <Route
                path="customers"
                element={<CustomerManagement />}
              />
            </Route>

          </Route>
        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
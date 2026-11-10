import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="stock/upload" element={<StockUpload />} />
            <Route path="dealers" element={<DealerNetwork />} />
            <Route path="stock/approvals" element={<TransferApprovals />} />
            <Route path="stock/inventory" element={<StockInventory />} />
            <Route path="dealers/create" element={<CreateDealer />} />
            <Route path="dealers/:id/edit" element={<EditDealer />} />
            <Route path="sub-dealers" element={<SubDealerNetwork />} />
            <Route path="sub-dealers/create" element={<CreateSubDealer />} />
            <Route path="sub-dealers/:id/edit" element={<EditSubDealer />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="users/create" element={<CreateUser />} />
            <Route path="users/:id/edit" element={<EditUser />} />
            <Route path="employees/create" element={<EmployeeForm />} />
            <Route path="employees" element={<EmployeeDirectory />} />
            <Route path="billing" element={<Billing />} />
            <Route path="delivery" element={<Delivery />} />

          </Route>
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
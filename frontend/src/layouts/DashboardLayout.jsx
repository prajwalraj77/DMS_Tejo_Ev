import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#f4f5f2]">

      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] lg:block">
        <Sidebar />
      </aside>

      {/* Main Application */}
      <div className="min-h-screen lg:ml-[250px]">

        {/* Header */}
        <Header />

        {/* Page Content */}
        <main>
          <div className="mx-auto w-full max-w-[1600px] px-5 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;
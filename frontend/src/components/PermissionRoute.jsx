import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

import {
  hasPermission,
} from "../utils/permissions.js";


function PermissionRoute({
  permission,
}) {
  const { user } =
    useAuth();

  if (
    !hasPermission(
      user,
      permission
    )
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}

export default PermissionRoute;
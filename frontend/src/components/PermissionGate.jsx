import { useAuth } from "../context/AuthContext.jsx";
import {
  hasPermission,
} from "../utils/permissions.js";

function PermissionGate({
  permission,
  children,
  fallback = null,
}) {
  const { user } = useAuth();

  if (
    !hasPermission(
      user,
      permission
    )
  ) {
    return fallback;
  }

  return children;
}

export default PermissionGate;
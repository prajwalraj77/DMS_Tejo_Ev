import { ALL_PERMISSIONS } from "../constants/permissions.js";

const permissionMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!ALL_PERMISSIONS.includes(requiredPermission)) {
      console.error(
        `Invalid permission configured on route: ${requiredPermission}`
      );

      return res.status(500).json({
        message: "Invalid permission configuration",
      });
    }

    // ADMIN has full access.
    if (req.user.role === "ADMIN") {
      return next();
    }

    const userPermissions = Array.isArray(req.user.permissions)
      ? req.user.permissions
      : [];

    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
        requiredPermission,
      });
    }

    next();
  };
};

export default permissionMiddleware;
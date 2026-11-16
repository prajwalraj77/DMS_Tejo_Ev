const { ALL_PERMISSIONS } = require("../constants/permissions");

const permissionMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    // User must be authenticated first.
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Validate that the permission used by the route
    // actually exists in our central permission list.
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

    // Get permissions from the authenticated user.
    const userPermissions = Array.isArray(req.user.permissions)
      ? req.user.permissions
      : [];

    // Check whether the user has the required permission.
    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
        requiredPermission,
      });
    }

    next();
  };
};

module.exports = permissionMiddleware;
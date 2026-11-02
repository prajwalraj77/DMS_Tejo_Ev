
const permissionMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Admin can access all modules and actions.
    if (req.user.role === "ADMIN") {
      return next();
    }

    const userPermissions = req.user.permissions || [];

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

export function hasPermission(
  user,
  permission
) {
  if (!user) {
    return false;
  }

  if (user.role === "ADMIN") {
    return true;
  }

  return (
    user.permissions || []
  ).includes(permission);
}


export function hasAnyPermission(
  user,
  permissions = []
) {
  if (!user) {
    return false;
  }

  if (user.role === "ADMIN") {
    return true;
  }

  return permissions.some(
    (permission) =>
      (user.permissions || []).includes(
        permission
      )
  );
}


export function hasAllPermissions(
  user,
  permissions = []
) {
  if (!user) {
    return false;
  }

  if (user.role === "ADMIN") {
    return true;
  }

  return permissions.every(
    (permission) =>
      (user.permissions || []).includes(
        permission
      )
  );
}
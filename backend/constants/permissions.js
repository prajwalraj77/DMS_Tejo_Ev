const PERMISSIONS = {
  // Vehicles
  VEHICLES_VIEW: "vehicles.view",
  VEHICLES_CREATE: "vehicles.create",
  VEHICLES_EDIT: "vehicles.edit",
  VEHICLES_DELETE: "vehicles.delete",

  // Inventory
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_CREATE: "inventory.create",
  INVENTORY_EDIT: "inventory.edit",
  INVENTORY_DELETE: "inventory.delete",

  // Stock Inward
  STOCK_INWARDS_VIEW: "stockInwards.view",
  STOCK_INWARDS_CREATE: "stockInwards.create",
  STOCK_INWARDS_EDIT: "stockInwards.edit",
  STOCK_INWARDS_DELETE: "stockInwards.delete",
  STOCK_INWARDS_APPROVE: "stockInwards.approve",

  // Customers
  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_CREATE: "customers.create",
  CUSTOMERS_EDIT: "customers.edit",
  CUSTOMERS_DELETE: "customers.delete",

  // Billing
  BILLING_VIEW: "billing.view",
  BILLING_CREATE: "billing.create",
  BILLING_EDIT: "billing.edit",
  BILLING_DELETE: "billing.delete",

  // Payments
  PAYMENTS_VIEW: "payments.view",
  PAYMENTS_CREATE: "payments.create",
  PAYMENTS_EDIT: "payments.edit",
  PAYMENTS_DELETE: "payments.delete",

  // Delivery
  DELIVERIES_VIEW: "deliveries.view",
  DELIVERIES_CREATE: "deliveries.create",
  DELIVERIES_EDIT: "deliveries.edit",
  DELIVERIES_DELETE: "deliveries.delete",

  // Employees
  EMPLOYEES_VIEW: "employees.view",
  EMPLOYEES_CREATE: "employees.create",
  EMPLOYEES_EDIT: "employees.edit",
  EMPLOYEES_DELETE: "employees.delete",

  // Dealers
  DEALERS_VIEW: "dealers.view",
  DEALERS_CREATE: "dealers.create",
  DEALERS_EDIT: "dealers.edit",
  DEALERS_DELETE: "dealers.delete",

  // Sub-Dealers
  SUB_DEALERS_VIEW: "subDealers.view",
  SUB_DEALERS_CREATE: "subDealers.create",
  SUB_DEALERS_EDIT: "subDealers.edit",
  SUB_DEALERS_DELETE: "subDealers.delete",

  // Users
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_EDIT: "users.edit",
  USERS_DELETE: "users.delete",
  USERS_PERMISSIONS: "users.permissions",
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export {
  PERMISSIONS,
  ALL_PERMISSIONS,
};
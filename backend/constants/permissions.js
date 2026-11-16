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
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

module.exports = {
  PERMISSIONS,
  ALL_PERMISSIONS,
};